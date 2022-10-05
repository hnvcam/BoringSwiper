/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React, { useState } from 'react'
import {
  Text,
  View
} from 'react-native'

import BoringSwiper from './src/BoringSwiper'

const App = () => {
  const [index, setIndex] = useState(0)
  return (
    <View style={{
      flexDirection: 'column',
      height: '100%'
    }}>
      <BoringSwiper
        style={{ flex: 1, flexDirection: 'row' }}
        index={index}
        onChangeIndex={idx => {
          setIndex(idx)
          return true
        }}>
        <View style={{ backgroundColor: '#f5f5dc', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>t1</Text>
        </View>
        <View style={{ backgroundColor: '#f50000', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>t2</Text>
        </View>
        <View style={{ backgroundColor: '#0000ff', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>t3</Text>
        </View>
      </BoringSwiper>
    </View>
  )
}
export default App
