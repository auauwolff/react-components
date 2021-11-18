import React, { useState } from 'react';
import { Story } from '@storybook/react';
import { Typography, Box } from '@material-ui/core';
import MultiField from './MultiField';
import { MultiFieldProps } from './types';

export default {
  title: 'Example/MultiField',
  component: MultiField,
};

const Template: Story<MultiFieldProps> = (args) => {
  const [value, setValue] = useState<string | undefined>();

  return (
    <>
      <Typography>MultiField</Typography>
      <Typography>Value: {value}</Typography>

      <Box
        position="inline"
        height={500}
        width={600}
        p={2}
        m={2}
        style={{ backgroundColor: '#cccccc' }}
      >
        <Typography>Parent view</Typography>
        <MultiField
          {...args}
          value={value}
          onChange={(newValue) => setValue(newValue)}
        />
      </Box>
    </>
  );
};

export const Minimal = Template.bind({});
Minimal.args = {};

export const AllProps = Template.bind({});
AllProps.args = {
  length: 8,
  seperationInterval: 2,
  fontSize: 40,
  seperatorChar: ':',
};
