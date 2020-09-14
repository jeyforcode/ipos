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
          <Mytext text="Print Bluetooth" />
          <Mybutton
            title="Print"
            customClick={() => navigation.navigate('Print')}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Mytext text="Semua Transaksi" />
          <Mybutton
            title="ViewAll"
            customClick={() => navigation.navigate('ViewAll')}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Mytext text="Insert Transaksi" />
          <Mybutton
            title="InsertTransaksi"
            customClick={() => navigation.navigate('InsertTransaksi')}
          />
        </View>
        <Text style={{ fontSize: 18, textAlign: 'center', color: 'grey' }}>
          iPOS Praktek dr. Siska Ralisa
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;