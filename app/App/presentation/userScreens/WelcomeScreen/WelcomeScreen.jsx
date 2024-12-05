import { View, StyleSheet, ImageBackground } from 'react-native'
import React from 'react'
import ProfileSection from './ProfileSection'
import WhatWeDoSection from './WhatWeDoSection'
import RecentSection from './RecentSection'
import DiscoverSection from './DiscoverSection'

export default function ({user}) {
  return (
    <View >
      <ImageBackground source={require('./../../../assets/images/EllipseProfile.png')} resizeMode="contain" style={styles.image}/>
      <ProfileSection user={user}></ProfileSection>
      <WhatWeDoSection></WhatWeDoSection>
      <RecentSection></RecentSection>
      <DiscoverSection></DiscoverSection>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    position: "absolute",
    width: "100%",
    marginTop: -60,
    height: 300,
  },
})