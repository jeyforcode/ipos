// Example: Pre-Populated SQLite Database in React Native
// https://aboutreact.com/example-of-pre-populated-sqlite-database-in-react-native
// Screen to register the user

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Alert,
  SafeAreaView,
  Text,
} from 'react-native';
import Mytextinput from './components/Mytextinput';
import Mybutton from './components/Mybutton';
import Mytext from './components/Mytext';
import { openDatabase } from 'react-native-sqlite-storage';

//Connction to access the pre-populated user_db.db
var db = openDatabase({name: 'ipos.db', createFromLocation: '~/ipos.db', location: 'Library'}, (open) => { console.log('success') }, (e) => { console.log(e) });

var dateFormat = require('dateformat');

const InsertTransaksi = ({ navigation }) => {
  let [Pasien, setPasien] = useState('');
  let [SubTotal, setSubTotal] = useState('');
  let [Diskon, setDiskon] = useState('');
  let [Total, setTotal] = useState('');
  let [Catatan, setCatatan] = useState('');

  let calcTotalFromSubTotal = (SubTotal) => {
    let total = 0;
    if(SubTotal) {
      total = parseInt(SubTotal) - (parseInt(Diskon) || 0);
    }
    setTotal(total)
  }

  let calcTotalFromDiskon = (Diskon) => {
    let total = 0;
    if(SubTotal) {
      total = parseInt(SubTotal) - (parseInt(Diskon) || 0);
    }
    setTotal(total)
  }

  let create_transaction = () => {
    if (!Pasien || !SubTotal || !Diskon || !Total || !Catatan) {
      alert('Please fill mandatory input');
      return;
    }

    db.transaction(function (tx) {
      tx.executeSql(
        'INSERT INTO transaksi (trs_pasien, trs_sub_total, trs_diskon, trs_total, trs_kasir, trs_date, trs_catatan) VALUES (?,?,?,?,?,?,?)',
        [Pasien, SubTotal, Diskon, Total, 'Tiwi', dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss"), Catatan],
        (tx, results) => {
          console.log('Results', results.rowsAffected);
          if (results.rowsAffected > 0) {
            Alert.alert(
              'Success',
              'You are Registered Successfully',
              [
                {
                  text: 'Ok',
                  onPress: () => navigation.navigate('HomeScreen'),
                },
              ],
              { cancelable: false }
            );
          } else alert('Registration Failed');
        },(err) => {
          console.log("SQL Error: " + JSON.stringify(err))
        }
      );
    });
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        <View style={{ flex: 1 }}>
          <ScrollView keyboardShouldPersistTaps="handled">
            <KeyboardAvoidingView
              behavior="padding"
              style={{ flex: 1, justifyContent: 'space-between' }}>
              <Mytextinput
                placeholder="Nama Pasien"
                onChangeText={(Pasien) => setPasien(Pasien)}
                style={{ padding: 10 }}
              />
              <Mytextinput
                placeholder="Sub Total"
                onChangeText={(SubTotal) => 
                  {
                    setSubTotal(SubTotal)
                    calcTotalFromSubTotal(SubTotal)
                  }
                }
                style={{ padding: 10 }}
              />
              <Mytextinput
                placeholder="Diskon"
                onChangeText={(Diskon) => 
                  {
                    setDiskon(Diskon)
                    calcTotalFromDiskon(Diskon)
                  }
                }
                style={{ padding: 10 }}
              />
              <Mytextinput
                placeholder="Catatan"
                onChangeText={(Catatan) => setCatatan(Catatan)}
                style={{ padding: 10 }}
              />
               <Mytext text={`Grand Total: ${(Total || 0)}`} />
              <Mybutton title="Submit" customClick={create_transaction} />
            </KeyboardAvoidingView>
          </ScrollView>
        </View>
        <Text style={{ fontSize: 18, textAlign: 'center', color: 'grey' }}>
          iPOS Praktek dr. Siska Ralisa
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default InsertTransaksi;