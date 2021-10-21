import { CompositeLayer, BitmapLayer, Position } from 'deck.gl';
import { fetchMapAnimationFiles } from '../../api/Map/MapApi';
import { convertWGS84ToEPSG3857 } from './helpers';
import { AnimationLayerState, AnimationLayerProps, AnimationImageRequest, BitmapLayerData } from './types';
import { debounceTime, switchMap } from 'rxjs/operators';
import { Subject, of, forkJoin } from 'rxjs';

class AnimationLayer extends CompositeLayer<AnimationLayerState, AnimationLayerProps> {

  initializeState() {
    // Setup pipeline for fetching map animation images.
    const quickFetchPipeline = this.createImageRetrievalPipeline();
    const mainFetchPipeline = this.createImageRetrievalPipeline();

    this.state = {
      currentTimestamp: new Date().getTime().toString(),
      timestepLayers: [],
      abortFetchController: null,
      quickFetchPipeline: quickFetchPipeline,
      mainFetchPipeline: mainFetchPipeline,
    };

    this.fetchTimestepData();
  }

  fetchTimestepData() {
    const { apiHost, connectionString, token, filename, timesteps, style, shadingType, itemNumber, scale } = this.props;

    if (this.context.viewport.width === 1 || this.context.viewport.height === 1) {
      return;
    }

    // Create EPSG:3857 bounding box for use with domain services.
    const nw = this.context.viewport.unproject([0, 0]);
    const se = this.context.viewport.unproject([this.context.viewport.width, this.context.viewport.height]);

    const epsg3857se = convertWGS84ToEPSG3857(se[0], se[1]);
    const epsg3857nw = convertWGS84ToEPSG3857(nw[0], nw[1]);

    // Create WGS84 bounding box for use with DeckGL.
    const bbox: any = [nw[0], se[1], se[0], nw[1]];

    // Generate the request body to retrieve the images for the timesteps of interest.
    const requestBody: any = {};
    const currentTimestepRequest = {};

    timesteps.forEach((timestep: string, index: number) => {
      requestBody[timestep] = filename;
      if (index === this.props.currentTimestepIndex) {
        currentTimestepRequest[timestep] = filename;
      }
    });

    // Fetch data from backend.
    const { width, height } = this.context.viewport;

    const pipelineInput = {
      requestDataSource: {
        host: apiHost,
        connection: connectionString,
        ids: requestBody
      },
      requestConfig: {
        style: style,
        item: itemNumber,
        width: width,
        height: height,
        bbox: [epsg3857nw[0], epsg3857se[1], epsg3857se[0], epsg3857nw[1]].join(','),
        shadingType: shadingType,
        scale: scale,
      },
      bboxWGS84: bbox,
      timestepIndex: null,
      token,
    };

    this.state.quickFetchPipeline.next({
      ...pipelineInput,
      requestDataSource: {
        ...pipelineInput.requestDataSource,
        ids: currentTimestepRequest,
      },
      timestepIndex: this.props.currentTimestepIndex,
    });
  
    this.state.mainFetchPipeline.next(pipelineInput);
  }

  updateState({oldProps, changeFlags}: {oldProps: any, changeFlags: any}) {
    if (Object.keys(oldProps).length === 0) {
      return;
    }

    let shouldFetchData = false;

    if (changeFlags.viewportChanged || changeFlags.dataChanged) {
      shouldFetchData = true;
    }

    if (changeFlags.propsChanged && changeFlags.propsChanged !== 'props.currentTimestepIndex changed shallowly') {
      shouldFetchData = true;
    }

    if (shouldFetchData) {
      this.fetchTimestepData();
    }
  }

  createImageRetrievalPipeline() {
    const self = this;

    const fetchPipeline = new Subject<AnimationImageRequest>();
    fetchPipeline
      .pipe(
        debounceTime(500),
        switchMap((imageRequest: AnimationImageRequest) => 
          fetchMapAnimationFiles(imageRequest.requestDataSource, imageRequest.requestConfig, imageRequest.token)
            .pipe(
              switchMap((response) => forkJoin(
                of(imageRequest),
                response.json()
              ),
            )
          )
        ),
      )
      .subscribe({
        next: ([request, encodedImages]) => {
          const currentTimestamp = new Date().getTime();
          this.setState({ currentTimestamp });

          const timestepImageData = Object.entries(encodedImages)
            .map(([timestepStr, encodedImage]) => {
              return {
                timestep: timestepStr,
                imageURL:  `data:image/png;base64,${encodedImage}`, 
              }
            });
          timestepImageData.sort((a, b) => {
            if (a.timestep < b.timestep)
              return -1;
            if (a.timestep > b.timestep)
              return 1;
            return 0;
          });

          if (request.timestepIndex !== null) {
            this.setState({
              timestepLayers: this.state.timestepLayers.map((layer: BitmapLayer<BitmapLayerData>) => {
                if (layer.props.id.endsWith(`timestep=${request.timestepIndex}`)) {
                  return new BitmapLayer<BitmapLayerData>({
                    id: `AnimationLayer-${currentTimestamp}-timestep=${request.timestepIndex}`,
                    image: timestepImageData[0].imageURL,
                    visible: true,
                    bounds: request.bboxWGS84 as any,
                  }); 
                } else {
                  return layer;
                }
              })
            });
          } else {
            this.setState({
              timestepLayers: timestepImageData.map((imageData, idx) => {
                return new BitmapLayer<BitmapLayerData>({
                  id: `AnimationLayer-${this.state.currentTimestamp}-timestep=${imageData.timestep}`,
                  image: imageData.imageURL,
                  visible: idx === self.props.currentTimestepIndex,
                  bounds: request.bboxWGS84 as any,
                });
              })
            });
          }
      },
      error: e => console.error(e),
    });

    return fetchPipeline;
  }

  finaliseState() {
    if (this.state.timestepLayers) {
      this.setState({
        timestepLayers: []
      });
    }
  }

  renderLayers() {
    this.setState({
      timestepLayers: this.state.timestepLayers.map((layer: BitmapLayer<BitmapLayerData>, index: number) => {
        if (layer.lifecycle === 'Awaiting state' || layer.props.image == null || layer.props.bounds == null) {
          return layer;
        }

        const isVisible = index === this.props.currentTimestepIndex;

        return new BitmapLayer<BitmapLayerData>({
          id: layer.props.id,
          image: layer.props.image,
          visible: isVisible,
          bounds: layer.props.bounds,
        });
      }),
    });

    return this.state.timestepLayers;
  }
}

export default AnimationLayer;
