import React, { Fragment } from 'react';
import { FormControl, FormControlLabel, InputLabel, MenuItem, Select, Switch, TextField } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  FormControl: {
    width: '100%',
    marginTop: theme.spacing(1),
  },
  switch: {
    marginTop: theme.spacing(1),
  },
}));

export default function AccountMetadata({
  metadataAccounts,
  data,
  handleChange,
}: {
  metadataAccounts?: MetadataAccount[];
  data: {};
  handleChange(key: string, value: any): void;
}) {
  const classes = useStyles();

  return (
    <Fragment>
      {metadataAccounts?.map((meta, i) => {
        if (meta.type === 'Text') {
          return (
            <TextField
              key={i}
              fullWidth
              margin="dense"
              label={meta.label}
              variant="standard"
              value={data[meta.key]}
              onChange={(e) => handleChange(meta.key, e.target.value)}
            />
          );
        } else if (meta.type === 'SingleChoice') {
          return (
            <FormControl className={classes.FormControl} key={i}>
              <InputLabel>{meta.label}</InputLabel>
              <Select
                fullWidth
                defaultValue={meta?.default}
                value={data[meta.key]}
                id={meta.key}
                onChange={(e) => handleChange(meta.key, e.target.value)}
              >
                {meta.options.map((item, index) => (
                  <MenuItem key={index} value={item}>
                    {item}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          );
        } else if (meta.type === 'Boolean') {
          return (
            <FormControlLabel
              key={i}
              className={classes.switch}
              control={
                <Switch
                  color="primary"
                  checked={data && data[meta.key] !== undefined ? data[meta.key] : meta?.default}
                  onChange={(e) => handleChange(meta.key, e.target.checked)}
                  name={meta.label}
                  inputProps={{ 'aria-label': meta.label }}
                />
              }
              label={meta.label}
            />
          );
        } else if (meta.type === 'MultiChoice') {
          return (
            <Autocomplete
              key={i}
              placeholder={`Select ${meta.label}`}
              options={meta.options}
              defaultValue={meta?.default}
              value={data[meta.key]}
              onChange={(e, values) => handleChange(meta.key, values)}
              multiple={true as any}
              renderInput={(props) => (
                <TextField
                  {...props}
                  name={meta.key}
                  variant="standard"
                  label={meta.label}
                  placeholder="Select"
                  autoComplete="off"
                />
              )}
              style={{
                marginTop: 8,
              }}
            />
          );
        }

        return null;
      })}
    </Fragment>
  );
}
