
'use client';

import React from 'react';
import Cropper, { type CropperProps } from 'react-easy-crop';
export { type Area } from 'react-easy-crop';

const ImageCropper = (props: CropperProps) => {
  return <Cropper {...props} />;
};

export default ImageCropper;
