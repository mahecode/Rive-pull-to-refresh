# Custom Pull-to-Refresh with Rive

This project demonstrates a custom pull-to-refresh implementation in React Native using **`rive-react-native`** for animation, **`react-native-gesture-handler`** for gesture handling, and the native pull-to-refresh capabilities of **`FlatList`**.

## Requirements

Ensure the following dependencies are installed in your project:

- **React Native** version **`> 0.71`**
- **[rive-react-native](https://github.com/rive-app/rive-react-native)** for Rive animations
- **[react-native-gesture-handler](https://docs.swmansion.com/react-native-gesture-handler/docs/)** for gesture handling

## Installation

1. **Install Required Packages:**

   Ensure that the necessary packages are installed:

   ```bash
   npm install rive-react-native react-native-gesture-handler

## Place Your Rive File

Place your Rive animation file inside the `android/app/src/main/res/raw/` directory with the name `pull_to_refresh_use_case.riv`. The file structure should look like this:

```css
android/
└── app/
    └── src/
        └── main/
            └── res/
                └── raw/
                    └── pull_to_refresh_use_case.riv
