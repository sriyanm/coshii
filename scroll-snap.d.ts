declare module "scroll-snap" {
  export default function createScrollSnap(
    element: HTMLElement,
    settings: {
      snapDestinationX?: string | number;
      snapDestinationY?: string | number;
      timeout?: number;
      duration?: number;
      threshold?: number;
      snapStop?: boolean;
      easing?: (t: number) => number;
    },
    callback?: () => void,
  ): {
    bind: () => void;
    unbind: () => void;
  };
}
