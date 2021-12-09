import React from 'react';
import { Story } from '@storybook/react';
import { Typography, Box } from '@material-ui/core';
import { useArgs } from '@storybook/client-api';
import MultiField from './MultiField';
import { MultiFieldProps } from './types';

export default {
  title: 'Example/MultiField',
  component: MultiField,
};

const Template: Story<MultiFieldProps> = (args) => {
  const [{ value }, updateArgs] = useArgs();
  const setValue = (newValue: string) => updateArgs({ value: newValue });

  return (
    <>
      <Typography>MultiField</Typography>
      <Typography variant="subtitle2">
        Note: changing the length and placeholderChar props dynamically is not
        yet supported
      </Typography>

      <Box
        position="inline"
        height={500}
        width={600}
        p={2}
        m={2}
        style={{ backgroundColor: '#cccccc' }}
      >
        <Typography variant="h4">Parent view</Typography>
        <Typography>Value: {value}</Typography>
        <MultiField
          autoFocus={false}
          {...args}
          value={value}
          onChange={(newValue) => setValue(newValue)}
        />
      </Box>
    </>
  );
};

export const Minimal = Template.bind({});
Minimal.args = {
  autoFocus: false,
};

export const AllProps = Template.bind({});
AllProps.args = {
  length: 8,
  seperationInterval: 2,
  fontSize: 40,
  seperatorChar: ':',
};
