import { View, ViewProps, LayoutChangeEvent, Animated, StyleProp, PanResponder } from 'react-native'
import React, { FunctionComponent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import _ from 'lodash'

type BoringSwiperProps = ViewProps & {
    index: number
    onChangeIndex: (index: number) => boolean
    containerStyle?: StyleProp<ViewProps>
    pageStyle?: StyleProp<ViewProps>
}

const BoringSwiper:FunctionComponent<BoringSwiperProps> = ({
  children,
  index = 0,
  onChangeIndex,
  style,
  containerStyle,
  pageStyle
}) => {
  const [pageWidth, setPageWidth] = useState(0)
  const storeLayout = useCallback((evt: LayoutChangeEvent) => {
    setPageWidth(evt.nativeEvent.layout.width)
  }, [])

  const currentIndex = useRef(index)

  const translateXs = useMemo(
    () => React.Children.map(children, () => new Animated.Value(0)),
    [children]
  )

  const nextPageIndex = useMemo(() => index < _.size(translateXs) - 1 ? index + 1 : 0, [index, children])
  const prevPageIndex = useMemo(() => index > 0 ? index - 1 : _.size(translateXs) - 1, [index, children])
  const currentPageTx = useMemo(() => -index * pageWidth, [index, pageWidth])
  const nextPageBaseTx = useMemo(() => (index + 1 - nextPageIndex) * pageWidth, [index, pageWidth])
  const prevPageBaseTx = useMemo(() => (index - 1 - prevPageIndex) * pageWidth, [index, pageWidth])

  const springAnimate = useCallback((items: {index: number, toValue: number}[]) => {
    const animations = _.reduce(items, (acc, value) => {
      const tx = _.nth(translateXs, value.index)
      if (tx) {
        acc.push(Animated.spring(tx, {
          toValue: value.toValue,
          useNativeDriver: true
        }))
      }
      return acc
    }, [] as Array<Animated.CompositeAnimation>)
    Animated.parallel(animations).start()
  }, [translateXs])

  const reset = (dx: number) => {
    const items = [{ index, toValue: currentPageTx }]
    if (dx > 0) {
      items.push({ index: prevPageIndex, toValue: prevPageBaseTx })
    } else if (dx < 0) {
      items.push({ index: nextPageIndex, toValue: nextPageBaseTx })
    }
    console.log(items)
    springAnimate(items)
  }

  const panResponder = useMemo(
    () => PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove (e, { dx }) {
        _.nth(translateXs, index)?.setValue(currentPageTx + dx)

        if (dx < 0) {
          _.nth(translateXs, nextPageIndex)?.setValue(nextPageBaseTx + dx)
          if (prevPageIndex !== nextPageIndex) {
            _.nth(translateXs, prevPageBaseTx)?.setValue(0)
          }
        } else if (dx > 0) {
          _.nth(translateXs, prevPageIndex)?.setValue(prevPageBaseTx + dx)
          if (nextPageIndex !== prevPageIndex) {
            _.nth(translateXs, nextPageBaseTx)?.setValue(0)
          }
        }
      },
      onPanResponderRelease: (e, { dx }) => {
        let changedIndex = false
        if (Math.abs(dx) > pageWidth / 3) {
          changedIndex = onChangeIndex(dx > 0 ? prevPageIndex : nextPageIndex)
        }
        if (!changedIndex) {
          reset(dx)
        }
      },
      onPanResponderTerminationRequest: () => false
    })
    , [pageWidth, children])

  useEffect(() => {
    console.log(currentIndex.current, index, currentPageTx, prevPageBaseTx)
  }, [index])

  return (
    <View
        onLayout={storeLayout}
        style={style}
    >
        <Animated.View
            style={[
              containerStyle,
              {
                flexDirection: 'row',
                width: pageWidth * React.Children.count(children)
              }
            ]}
            {...panResponder.panHandlers}
        >
            {React.Children.map(children, (child, idx) => (
                <Animated.View
                    style={[
                      pageStyle,
                      {
                        width: pageWidth,
                        transform: [
                          { translateX: _.nth(translateXs, idx) || 0 }
                        ]
                      }
                    ]}
                >
                    {child}
                </Animated.View>
            ))}
        </Animated.View>
    </View>
  )
}

export default BoringSwiper
