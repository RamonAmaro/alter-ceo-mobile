import { forwardRef } from "react";
import { ScrollView, type ScrollViewProps } from "react-native";

type KeyboardAwareScrollProps = ScrollViewProps & {
  bottomOffset?: number;
  disableScrollOnKeyboardHide?: boolean;
  enabled?: boolean;
  extraKeyboardSpace?: number;
};

export const KeyboardAwareScroll = forwardRef<ScrollView, KeyboardAwareScrollProps>(
  function KeyboardAwareScroll(
    { bottomOffset, disableScrollOnKeyboardHide, enabled, extraKeyboardSpace, ...rest },
    ref,
  ) {
    void bottomOffset;
    void disableScrollOnKeyboardHide;
    void enabled;
    void extraKeyboardSpace;
    return <ScrollView ref={ref} {...rest} />;
  },
);
