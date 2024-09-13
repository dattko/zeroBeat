import React from 'react';

export const stopPropagation = (e: React.SyntheticEvent) => e.stopPropagation();

export const preventDefault = (e: React.SyntheticEvent) => e.preventDefault();

export const stopPropagationAndPreventDefault = (e: React.SyntheticEvent) => {
  e.stopPropagation();
  e.preventDefault();
}; 