import { View, ViewProps, Animated, ViewStyle } from 'react-native'
import React, { FunctionComponent, useEffect, useMemo, useRef } from 'react'
import _ from 'lodash'

type BoringDotsProps = ViewProps & {
    size?: number
    magnifiedSize?: number
    count: number
    activeIndex: number
    color?: string
    dotStyle?: ViewStyle
}
const BoringDots: FunctionComponent<BoringDotsProps> = ({
  size = 10,
  magnifiedSize = 15,
  color = '#000000',
  activeIndex,
  count,
  style,
  dotStyle
}) => {
  const sizes = useMemo(() => _.times(count, () => new Animated.Value(size)), [count])
  const lastIndex = useRef(-1)

  useEffect(() => {
    const activeDotSize = _.nth(sizes, activeIndex)
    if (!activeDotSize) {
      return
    }
    const springs = [Animated.spring(activeDotSize, { toValue: magnifiedSize, useNativeDriver: false })]
    const lastDotSize = _.nth(sizes, lastIndex.current)
    if (lastDotSize) {
      springs.push(Animated.spring(lastDotSize, { toValue: size, useNativeDriver: false }))
      lastIndex.current = activeIndex
    }
    Animated.parallel(springs).start()
  }, [activeIndex])

  return (
    <View style={[{ flexDirection: 'row', height: magnifiedSize, alignItems: 'center' }, style]}>
      {_.times(count, (index) => {
        const size = _.nth(sizes, index)
        return (<Animated.View
            key={`dot-${index}`}
            style={[
              { borderRadius: 100, backgroundColor: color, margin: 4 },
              dotStyle,
              { width: size, height: size }
            ]}/>)
      })}
    </View>
  )
}

export default BoringDots
