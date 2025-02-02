/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable react/no-array-index-key */
import React, { forwardRef, memo, useState } from 'react';
import {
  Box,
  Typography,
  Tooltip,
  IconButton,
  Collapse,
} from '@material-ui/core';
import CodeIcon from '@material-ui/icons/Code';

// #region Local imports
import { ComponentItemProps, SubList } from './types';
import Syntax from '../../Syntax/Syntax';
// #endregion

import useStyles from './styles';

const ComponentItem: React.FC<ComponentItemProps> = forwardRef<
  HTMLElement,
  ComponentItemProps
>(({ item }, ref) => {
  const classes = useStyles();

  const [showCode, setShowCode] = useState<Record<string, boolean>>({});

  const beautifyCode = (sub: SubList) =>
    sub.components.map((comp) => `${comp.codeExample}\n`).join('');

  return (
    <Box
      {...{ ref }}
      width={1}
      paddingTop={10}
      className={classes.container}
      id={`box-component-${item.title}`}
    >
      <Typography variant="h1">{item.title}</Typography>
      <Typography variant="h5" className={classes.desc}>
        {item.description}
      </Typography>
      {item.sub?.map((c, i) => (
        <div key={`${c.title}-${i}`}>
          <Typography variant="h2" className={classes.subtitle}>
            {c.title}
          </Typography>
          <Typography variant="body2" className={classes.subDesc}>
            {c.description}
          </Typography>
          <div className={classes.exampleWrapper}>
            {c.components?.map((c1, ii) => (
              <Box key={`component-${c.title}-${ii}`} m={1}>
                {c1.component}
              </Box>
            ))}
          </div>
          {c.components.find((sl) => sl.codeExample) && (
            <>
              <Box display="flex" width={1} justifyContent="flex-end">
                <Tooltip title="Show code" placement="left">
                  <IconButton
                    onClick={() =>
                      setShowCode((prev) => ({
                        ...prev,
                        [c.title]: !showCode[c.title],
                      }))
                    }
                  >
                    <CodeIcon />
                  </IconButton>
                </Tooltip>
              </Box>
              <Collapse in={showCode[c.title]}>
                <Syntax
                  code={`import { ${item.title.replace(
                    ' ',
                    ''
                  )} } from '@material-ui/core'\n\n${beautifyCode(c)}`}
                />
              </Collapse>
            </>
          )}
        </div>
      ))}
    </Box>
  );
});

export default memo(ComponentItem);
