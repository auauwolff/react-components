import { makeStyles } from '@material-ui/core/styles';
import mikePalette from './mikePallete';

const Styles = makeStyles((theme) => ({
  root: {
    marginLeft: '2em',
    [theme.breakpoints.down('xs')]: {
      marginLeft: 0,
    },
  },
  mainContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  header: {
    display: 'flex',
    width: 'calc(100% - 230px)',
    paddingTop: 20,
    paddingBottom: 15,
    [theme.breakpoints.down('xs')]: {
      width: '100%',
    },
  },
  content: {
    flexBasis: 0,
    flexGrow: 300,
    minWidth: '40%',
    [theme.breakpoints.down('xs')]: {
      minWidth: '100%',
    },
  },
  sidenav: {
    [`--offset`]: '2rem',
    flexGrow: 1,
    flexBasis: 230,
    alignSelf: 'start',
    position: 'sticky',
    top: '2rem',
  },
  sidenavHeader: {},
  sidenavContent: {},
  item: {},
  component: {
    display: 'grid',
    gridTemplateRows: 'auto 1fr auto',
    position: 'relative',
    padding: '10px 10px 10px 25px',
    '& $sidenavHeader': {},
    '& $sidenavContent': {
      '& $ul': {
        listStyle: 'none',
        '& $li': {
          marginLeft: -20,
          paddingLeft: 10,
          lineHeight: '2.2em',
          '&:hover': {
            color: mikePalette.primary.light,
            borderLeft: `3px solid ${mikePalette.primary.light}`,
            cursor: 'pointer',
          },
        },
      },
    },
    [theme.breakpoints.down('xs')]: {
      display: 'none',
    },
  },
  highlightText: {
    backgroundColor: mikePalette.primary.light,
    borderRadius: 5,
    padding: '2px 4px 2px 4px',
  },
  codeContainer: {
    borderRadius: 5,
    backgroundColor: '#000',
  },
  tabItem: {
    textDecoration: 'none',
    cursor: 'pointer',
    color: 'inherit',
  },
}));

export default Styles;

// const muiRadioStyles = {
//   background: 'transparent',
//   height: '20px',
//   width: '20px',
//   margin: '-4px 0px',
//   '& svg:nth-of-type(1)': {
//     transform: 'scale(0.9)',
//   },
//   '& svg:nth-of-type(1) > path': {
//     fill: mikePalette.darkGrey.main,
//   },
//   '&$disabled': {
//     '& svg:nth-of-type(1) > path': {
//       fill: mikePalette.darkGrey.light,
//     },
//   },
//   /*  JSS `:after` won't apply to target unless there is a valid value for content: */
//   '&:after': {
//     content: 'open-quote',
//     color: mikePalette.mediumGrey.light,
//     background: mikePalette.mediumGrey.light,
//     display: 'block',
//     height: '20px',
//     width: '20px',
//     marginLeft: '-20px',
//     borderRadius: '10px',
//   },
// };

// export default muiRadioStyles;
