import React from "react";
import {
  Keyboard,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  type ViewProps,
} from "react-native";

type KeyboardDismissViewProps = ViewProps & {
  children: React.ReactNode;
};

const KeyboardDismissView: React.FC<KeyboardDismissViewProps> = ({
  children,
  style,
  ...rest
}) => {
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={[styles.container, style]} {...rest}>
        {children}
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default KeyboardDismissView;
