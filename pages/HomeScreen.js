// Example: Example of SQLite Database in React Native
// https://aboutreact.com/example-of-sqlite-database-in-react-native

import React, { useEffect } from 'react';
import { View, Text, SafeAreaView } from 'react-native';
import Mybutton from './components/Mybutton';
import Mytext from './components/Mytext';

const HomeScreen = ({ navigation }) => {
  useEffect(() => {}, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        <View style={{ flex: 1 }}>
          <Mytext text="SQLite Example" />
          <Mybutton
            title="Print"
            customClick={() => navigation.navigate('Print')}
          />
        </View>
        <Text style={{ fontSize: 18, textAlign: 'center', color: 'grey' }}>
          Example of SQLite Database in React Native
        </Text>
        <Text style={{ fontSize: 16, textAlign: 'center', color: 'grey' }}>
          www.aboutreact.com
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;