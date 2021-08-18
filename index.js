import React, {useState} from 'react';
import {Platform, ScrollView, StyleSheet, View} from 'react-native';
import PropTypes from "prop-types";
import LinearGradient from "react-native-linear-gradient"

const defaultFadeColors = ['rgba(229, 229, 229, 0.18)', 'rgba(206, 201, 201, 0.6)', 'rgba(206, 201, 201, 0.9)'];

const RNFadedScrollView = ({
                               onContentSizeChange, horizontal, scrollThreshold, isRtl,
                               isCloseToStart, isCloseToEnd, onScroll,
                               fadeColors, startFadeStyle, endFadeStyle, fadeSize, containerStyle, allowDivider,
                               innerRef, style, children, dividerStyle, ...rest
                           }) => {
    const [scrollHeight, setScrollHeight] = useState(0);
    const [scrollWidth, setScrollWidth] = useState(0);
    const [availableWidth, setAvailableWidth] = useState(0);
    const [availableHeight, setAvailableHeight] = useState(0);
    const [allowStartFade, setAllowStartFade] = useState(false);
    const [allowEndFade, setAllowEndFade] = useState(true);

    const handleContentSizeChange = (contentWidth, contentHeight) => {
        // Save the content height in state
        setScrollHeight(contentHeight);
        setScrollWidth(contentWidth);

        if (onContentSizeChange)
            onContentSizeChange(contentWidth, contentHeight);
    };

    const handleLayout = (event) => {
        const containerWidth = event.nativeEvent.layout.width;
        const containerHeight = event.nativeEvent.layout.height;

        setAvailableWidth(containerWidth);
        setAvailableHeight(containerHeight)
    };

    const isEndFadeAllowed = () => {
        const sizeToCompare = horizontal ? scrollWidth : scrollHeight;
        const availableSpace = horizontal ? availableWidth : availableHeight;
        return allowEndFade ? sizeToCompare > availableSpace : false;
    }

    const ifCloseToStart = ({layoutMeasurement, contentOffset, contentSize}) => {
        return horizontal ? contentOffset.x < scrollThreshold : contentOffset.y < scrollThreshold;
    }

    const isCloseToBottom = ({layoutMeasurement, contentOffset, contentSize}) => {
        return horizontal ? layoutMeasurement.width + contentOffset.x >= contentSize.width - scrollThreshold : layoutMeasurement.height + contentOffset.y >= contentSize.height - scrollThreshold;
    }

    //To avoid ScrollView RTL issue on andorid.
    const allowReverse = () => {
        return Platform.OS === 'android' && isRtl
    }

    const onScrolled = (e) => {
        if (isCloseToEnd) {
            isCloseToEnd(isCloseToBottom(e.nativeEvent));
        }
        if (isCloseToStart) {
            isCloseToStart(ifCloseToStart(e.nativeEvent));
        }
        if (allowStartFade) {
            if (!allowReverse()) {
                setAllowStartFade(!ifCloseToStart(e.nativeEvent));
            } else {
                setAllowEndFade(!ifCloseToStart(e.nativeEvent));
            }
        }
        if (allowEndFade) {
            if (!allowReverse()) {
                setAllowEndFade(!isCloseToBottom(e.nativeEvent));
            } else {
                setAllowStartFade(!isCloseToBottom(e.nativeEvent));
            }
        }
        if (onScroll) {
            onScroll();
        }
    }

    //get start fade view
    const getStartFaade = () => {
        return (horizontal ?
                <LinearGradient
                    start={{x: isRtl ? 0 : 1, y: 0}} end={{x: isRtl ? 1 : 0, y: 0}}
                    style={[{position: 'absolute', start: 0, width: fadeSize, height: '100%'}, startFadeStyle]}
                    colors={fadeColors}
                    pointerEvents={'none'}
                /> :
                <LinearGradient
                    start={{x: 0, y: 1}} end={{x: 0, y: 0}}
                    style={[{position: 'absolute', top: 0, width: '100%', height: fadeSize}, startFadeStyle]}
                    colors={fadeColors}
                    pointerEvents={'none'}
                />
        )
    }

    const getEndFade = () => {
        return (horizontal ?
            <LinearGradient
                start={{x: isRtl ? 1 : 0, y: 0}} end={{x: isRtl ? 0 : 1, y: 0}}
                style={[{position: 'absolute', end: 0, width: fadeSize, height: '100%'}, endFadeStyle]}
                colors={fadeColors}
                pointerEvents={'none'}
            />
            :
            <LinearGradient
                start={{x: 0, y: 0}} end={{x: 0, y: 1}}
                style={[{position: 'absolute', bottom: 0, width: '100%', height: fadeSize}, endFadeStyle]}
                colors={fadeColors}
                pointerEvents={'none'}
            />)
    }

    const getDivider = () => {
        return (horizontal ? <View
            style={[{width: 1, height: '100%', backgroundColor: "#E6E6E6"}, dividerStyle]}
        /> : <View
            style={[{width: '100%', height: 1, backgroundColor: "#E6E6E6"}, dividerStyle]}
        />)
    }

    const endFadeEnable = isEndFadeAllowed();

    return (
        <View style={[styles.container, containerStyle, {flexDirection: horizontal ? "row" : "column"}]}
              onLayout={handleLayout}>
            {(allowStartFade && allowDivider) && getDivider()}
            <ScrollView
                {...rest}
                ref={innerRef}
                style={[styles.scrollViewStyle, style]}
                onContentSizeChange={handleContentSizeChange}
                scrollEventThrottle={16}
                onScroll={onScrolled}
            >
                {children}
            </ScrollView>
            {((endFadeEnable && allowEndFade) && allowDivider) && getDivider()}
            {(allowStartFade) && getStartFaade()}
            {(endFadeEnable && allowEndFade) && getEndFade()}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "column"
    },
    scrollViewStyle: {
        flex: 1
    }
});

RNFadedScrollView.propTypes = {
    allowStartFade: PropTypes.bool,
    allowEndFade: PropTypes.bool,
    fadeSize: PropTypes.number,
    fadeColors: PropTypes.array,
    isCloseToEnd: PropTypes.func,
    isCloseToStart: PropTypes.func,
    scrollThreshold: PropTypes.number,
    allowDivider: PropTypes.bool,
    isRtl: PropTypes.bool
}
RNFadedScrollView.defaultProps = {
    allowStartFade: false,
    allowEndFade: true,
    fadeSize: 20,
    fadeColors: defaultFadeColors,
    scrollThreshold: 10,
    allowDivider: false,
    isRtl: false
}

export default React.forwardRef((props, ref) => <RNFadedScrollView {...props} innerRef={ref} />);
