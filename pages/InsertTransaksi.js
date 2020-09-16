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
  Button
} from 'react-native';
import Mytextinput from './components/Mytextinput';
import Mybutton from './components/Mybutton';
import Mytext from './components/Mytext';
import { openDatabase } from 'react-native-sqlite-storage';
import Modal from 'react-native-modal';

//Connction to access the pre-populated user_db.db
var db = openDatabase({ name: 'ipraktek.db', createFromLocation: '~/ipraktek.db', location: 'Library' }, (open) => { console.log('success') }, (e) => { console.log(e) });

var dateFormat = require('dateformat');

const InsertTransaksi = ({ navigation }) => {
  let [Pasien, setPasien] = useState('');
  let [Diskon, setDiskon] = useState('');
  let [Total, setTotal] = useState('');
  let [SubTotal, setSubTotal] = useState('');
  let [Catatan, setCatatan] = useState('');
  let [Item, setItem] = useState('');
  let [Harga, setHarga] = useState('');
  let [IsModalVisible, setIsModalVisible] = useState(false);
  let [ListDetail, setListDetail] = useState([]);

  let calcTotalFromDiskon = (Diskon) => {
    let total = 0;
    if (ListDetail.length) {
      const totalDetail = ListDetail.reduce(function (accumulator, detail) {
        return accumulator + parseInt(detail.harga);
      }, 0);
      total = parseInt(totalDetail) - (parseInt(Diskon) || 0);
      setSubTotal(totalDetail)
    }
    setTotal(total)
  }

  let toggleModal = (type) => {
    if (['open', 'close'].includes(type)) setIsModalVisible(!IsModalVisible);
    if (type === 'save') {
      ListDetail.push({ item: Item, harga: Harga });
      setListDetail(ListDetail);
    }
  };

  let create_transaction = () => {
    if (!Pasien || !ListDetail.length) {
      alert('Please fill mandatory input');
      return;
    }

    db.transaction(function (tx) {
      tx.executeSql(
        'INSERT INTO transaksi (trs_pasien, trs_sub_total, trs_diskon, trs_total, trs_kasir, trs_date, trs_catatan, trs_detail) VALUES (?,?,?,?,?,?,?,?)',
        [Pasien, SubTotal, Diskon, Total, 'Tiwi', dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss"), Catatan, JSON.stringify(ListDetail)],
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
        }, (err) => {
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
                placeholder="Diskon"
                onChangeText={(Diskon) => {
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
              {ListDetail.map((val, idx) => {
                return (
                  <React.Fragment>
                    <View key={`item${idx}`}>
                      <Mytext text={`Item: ${val.item}`} />
                      <Mytext text={`Harga: ${val.harga}`} />
                    </View>
                  </React.Fragment>
                );
              })}
              <Mytext text={`Grand Total: ${(Total || 0)}`} />
              <Mybutton title="Add Item" customClick={() => toggleModal('open')} />
              <Mybutton title="Submit" customClick={create_transaction} />
              <Modal isVisible={IsModalVisible}>
                <View style={{ flex: 1, backgroundColor: 'white', justifyContent: 'center' }}>
                  <Mytextinput
                    placeholder="Nama Item"
                    onChangeText={(Item) => setItem(Item)}
                    style={{ padding: 10 }}
                  />
                  <Mytextinput
                    placeholder="Harga"
                    onChangeText={(Harga) => {
                      setHarga(Harga)
                    }
                    }
                    style={{ padding: 10 }}
                  />
                  <Mybutton title="Save Data" customClick={() => toggleModal('save')} />
                  <Mybutton title="Hide Modal" customClick={() => toggleModal('close')} />
                </View>
              </Modal>
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