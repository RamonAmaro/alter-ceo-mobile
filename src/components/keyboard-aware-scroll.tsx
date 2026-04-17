import { forwardRef } from "react";
import {
  KeyboardAwareScrollView,
  type KeyboardAwareScrollViewProps,
  type KeyboardAwareScrollViewRef,
} from "react-native-keyboard-controller";

export const KeyboardAwareScroll = forwardRef<
  KeyboardAwareScrollViewRef,
  KeyboardAwareScrollViewProps
>(function KeyboardAwareScroll(props, ref) {
  return <KeyboardAwareScrollView ref={ref} bottomOffset={20} {...props} />;
});
