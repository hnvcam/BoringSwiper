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
  const currentPage = useRef(0)
  const swipedRight = useRef(false)

  const translateXs = useMemo(
    () => React.Children.map(children, () => new Animated.Value(0)),
    [React.Children.count(children)]
  )

  const getNext = useCallback(
    (idx: number, page = 0) =>
      idx < _.size(translateXs) - 1 ? [idx + 1, page] : [0, page + 1],
    [translateXs]
  )
  const getPrev = useCallback(
    (idx: number, page = 0) =>
      idx > 0 ? [idx - 1, page] : [_.size(translateXs) - 1, page - 1],
    [translateXs]
  )
  const getSwipeIn = useCallback(
    (swipeRight: boolean) => swipeRight
      ? getPrev(index, currentPage.current)
      : getNext(index, currentPage.current),
    [index, translateXs]
  )
  const getBaseTx = useCallback(
    (idx: number, page: number) =>
      (page - currentPage.current) * _.size(translateXs) * pageWidth - index * pageWidth,
    [index, pageWidth, translateXs]
  )

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

  const panResponder = useMemo(
    () => PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove (e, { dx }) {
        const currentPageTx = getBaseTx(index, currentPage.current)
        _.nth(translateXs, index)?.setValue(currentPageTx + dx)

        if (dx === 0 || _.size(translateXs) <= 1) {
          return
        }

        const [showIndex, showPage] = getSwipeIn(dx > 0)
        const showPageTx = getBaseTx(showIndex, showPage)
        _.nth(translateXs, showIndex)?.setValue(showPageTx + dx)
      },
      onPanResponderRelease: (e, { dx }) => {
        let changedIndex = false
        if (Math.abs(dx) > pageWidth / 3 && _.size(translateXs) > 1) {
          const [newIndex, newPage] = getSwipeIn(dx > 0)
          changedIndex = onChangeIndex(newIndex)
          if (changedIndex) {
            swipedRight.current = dx > 0
            currentPage.current = newPage
          }
        }
        if (!changedIndex) {
          const springs = [{ index, toValue: getBaseTx(index, currentPage.current) }]
          if (_.size(translateXs) > 1) {
            const [hideIndex, hidePage] = getSwipeIn(dx > 0)
            springs.push({ index: hideIndex, toValue: getBaseTx(hideIndex, hidePage) })
          }
          springAnimate(springs)
        }
      },
      onPanResponderTerminationRequest: () => false
    })
    , [pageWidth, children])

  useEffect(() => {
    const springs = [{ index, toValue: getBaseTx(index, currentPage.current) }]
    if (_.size(translateXs) > 1) {
      const [hideIndex, hidePage] = getSwipeIn(!swipedRight.current)
      springs.push({ index: hideIndex, toValue: getBaseTx(hideIndex, hidePage) })
    }
    springAnimate(springs)
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
    </View>)
}

export default BoringSwiper
