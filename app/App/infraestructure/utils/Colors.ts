interface Colors {
  PRIMARY: string;
  GRAY: string;
  WHITE: string;
  BLACK: string;
  WHITE_TRANSP: string;
  BLUE: string;
  RED: string;
}

export const Colors: Colors = {
  PRIMARY: '#4CAF50',
  GRAY: '#9E9E9E',
  WHITE: '#FFFFFF',
  BLACK: '#000000',
  WHITE_TRANSP: 'rgba(255, 255, 255, 0.7)',
  BLUE: '#2196F3',
  RED: '#F44336'
};

export type ColorsType = typeof Colors; 