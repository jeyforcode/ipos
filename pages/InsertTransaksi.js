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
  AsyncStorage
} from 'react-native';
import Mytextinput from './components/Mytextinput';
import Mybutton from './components/Mybutton';
import Mytext from './components/Mytext';
import { openDatabase } from 'react-native-sqlite-storage';
import Modal from 'react-native-modal';
import { BluetoothEscposPrinter, BluetoothManager, BluetoothTscPrinter } from "react-native-bluetooth-escpos-printer";

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
  let [IsPrintDisable, setIsPrintDisable] = useState(true);
  let [IsCreateDisable, setIsCreateDisable] = useState(true);
  let [IsAddItemDisable, setIsAddItemDisable] = useState(false);
  let [IsSelesaiDisable, setIsSelesaiDisable] = useState(false);
  let [Tunai, setTunai] = useState('');
  let [Kembali, setKembali] = useState('');
  let [IsModalPrintVisible, setIsModalPrintVisible] = useState(false);
  let [TransaksiId, setTransaksiId] = useState('');

  let getTotalDetail = () => {
    const totalDetail = ListDetail.reduce(function (accumulator, detail) {
      return accumulator + parseInt(detail.harga);
    }, 0);
    return parseInt(totalDetail)
  }

  let calcTotalFromDiskon = (Diskon) => {
    let total = 0;
    if (ListDetail.length) {
      const totalDetail = getTotalDetail();
      total = totalDetail - (parseInt(Diskon) || 0);
      setSubTotal(totalDetail)
    }
    setTotal(total)
  }

  let calcKembali = (Tunai) => {
    const kembali = parseInt(Tunai) - parseInt(Total)
    if(kembali >= 0) {
      setIsSelesaiDisable(false)
    }
    setKembali(kembali);
  }

  let toggleModal = (type) => {
    if (['open', 'close'].includes(type)) {
      setIsModalVisible(!IsModalVisible);
      if (IsModalVisible) {
        const totalDetail = getTotalDetail();
        const total = totalDetail - (parseInt(Diskon) || 0);
        setSubTotal(totalDetail)
        setTotal(total)
      }
    }
    if (type === 'save') {
      ListDetail.push({ item: Item, harga: Harga });
      setListDetail(ListDetail);
      setIsCreateDisable(false);
    }
  };

  let togglePrintModal = () => {
    setIsModalPrintVisible(!IsModalPrintVisible);
    // navigation.navigate('HomeScreen')
  }

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
            setTransaksiId(results.insertId)
            Alert.alert(
              'Success',
              'Data berhasil disimpan',
              [
                {
                  text: 'Ok',
                  onPress: () => {
                    setIsPrintDisable(false);
                    setIsCreateDisable(true);
                    setIsAddItemDisable(true);
                  },
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

  let storeData = async () => {
    try {
      await AsyncStorage.setItem(
        'transaksi',
        JSON.stringify([Pasien, SubTotal, Diskon, Total, 'Tiwi', dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss"), Catatan, ListDetail, Tunai, Kembali, TransaksiId])
      );
    } catch (error) {
      // Error saving data
    }
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
                    <View key={`view${idx}`}>
                      <Mytext key={`item${idx}`} text={`Item: ${val.item}`} />
                      <Mytext key={`harga${idx}`} text={`Harga: ${val.harga}`} />
                    </View>
                  </React.Fragment>
                );
              })}
              <Mytext text={`Grand Total: ${(Total || 0)}`} />
              <Mybutton disabled={IsAddItemDisable} title="Tambah Item" customClick={() => toggleModal('open')} />
              <Mybutton disabled={IsCreateDisable} title="Simpan Data" customClick={create_transaction} />
              <Mybutton disabled={IsPrintDisable} title="Print Struct" customClick={() => togglePrintModal()} />
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
                  <Mybutton title="Simpan Data" customClick={() => toggleModal('save')} />
                  <Mybutton title="Kembali" customClick={() => toggleModal('close')} />
                </View>
              </Modal>
              <Modal isVisible={IsModalPrintVisible}>
                <View style={{ flex: 1, backgroundColor: 'white', justifyContent: 'center' }}>
                  <Mytext text={`Grand Total: ${(Total || 0)}`} />
                  <Mytextinput
                    placeholder="Tunai"
                    onChangeText={(Tunai) => {
                      setTunai(Tunai);
                      calcKembali(Tunai);
                    }}
                    style={{ padding: 10 }}
                  />
                  <Mytext text={`Uang Kembali: ${(Kembali || 0)}`} />
                  <Mybutton disabled={IsSelesaiDisable} title="Selesai" customClick={async () => { 
                    await storeData();
                    togglePrintModal();
                    navigation.navigate('Print');
                  }} />
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