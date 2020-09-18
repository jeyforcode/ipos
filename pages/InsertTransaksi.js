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
  AsyncStorage,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import Mytextinput from './components/Mytextinput';
import Mybutton from './components/Mybutton';
import Mytext from './components/Mytext';
import { openDatabase } from 'react-native-sqlite-storage';
import Modal from 'react-native-modal';
import { Table, TableWrapper, Row, Cell } from 'react-native-table-component';

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
  let [IsSelesaiDisable, setIsSelesaiDisable] = useState(true);
  let [Tunai, setTunai] = useState('');
  let [Kembali, setKembali] = useState('');
  let [IsModalPrintVisible, setIsModalPrintVisible] = useState(false);
  let [TransaksiId, setTransaksiId] = useState('');
  let [DataTable, setDataTable] = useState({
    tableHead: ['Item', 'Harga', 'Action'],
    tableData: []
  });

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
    if (kembali >= 0) {
      setIsSelesaiDisable(false)
    } else {
      setIsSelesaiDisable(true)
    }
    setKembali(kembali);
  }

  let calcGrandTotal = () => {
    const totalDetail = getTotalDetail();
    const total = totalDetail - (parseInt(Diskon) || 0);
    setSubTotal(totalDetail)
    setTotal(total)
  }

  let toggleModal = (type) => {
    if (['open', 'close'].includes(type)) {
      setIsModalVisible(!IsModalVisible);
      if (IsModalVisible) {
        calcGrandTotal()
      }
    }
    if (type === 'save') {
      ListDetail.push({ item: Item, harga: Harga });
      setListDetail(ListDetail);
      setIsCreateDisable(false);
      setDataTable({ ...DataTable, tableData: ListDetail })
      setItem('')
      setHarga('')
    }
  };

  let togglePrintModal = () => {
    setIsModalPrintVisible(!IsModalPrintVisible);
    // navigation.navigate('HomeScreen')
  }

  let create_transaction = () => {
    if (!Pasien || !ListDetail.length) {
      alert('Oops.. nama pasien masih kosong');
      return;
    }

    if(Total < 0) {
      alert('Oops.. grand total tidak sesuai');
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
          } else alert('Data gagal disimpan');
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

  const deleteItem = (data) => {
    if(IsCreateDisable) {
      alert('Oops.. data tidak bisa dihapus');
      return true;
    }
    Alert.alert(
      'Konfirmasi Hapus',
      'Mau hapus data ini?',
      [
        {
          text: 'Tidak',
          onPress: () => {
            console.log("Cancel Pressed")
          },
        },
        {
          text: 'Hapus',
          onPress: () => {
            ListDetail = ListDetail.filter(val => val.item !== data.item);
            setDataTable({ ...DataTable, tableData: ListDetail });
            setListDetail(ListDetail);
            calcGrandTotal();
            if(!ListDetail.length) {
              setIsCreateDisable(true);
              if(IsAddItemDisable && !IsPrintDisable) {
                setIsAddItemDisable(false);
              }
              setIsPrintDisable(true);
            }
          },
        }
      ],
      { cancelable: false }
    );
  }

  const element = (data) => (
    <TouchableOpacity onPress={() => deleteItem(data)}>
      <View style={styles.btn}>
        <Text style={styles.btnText}>Hapus</Text>
      </View>
    </TouchableOpacity>
  );

  const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, paddingTop: 30, backgroundColor: '#fff' },
    head: { height: 40, backgroundColor: '#808B97' },
    text: { margin: 6 },
    row: { flexDirection: 'row', backgroundColor: '#FFF1C1' },
    btn: { width: 58, height: 18, backgroundColor: '#78B7BB', borderRadius: 2 },
    btnText: { textAlign: 'center', color: '#fff' }
  });

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
                keyboardType={'numeric'} 
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
              {DataTable.tableData.length > 0 && (
                <View style={styles.container}>
                  <Table borderStyle={{ borderColor: 'transparent' }}>
                    <Row data={DataTable.tableHead} style={styles.head} textStyle={styles.text} />
                    {
                      DataTable.tableData.map((rowData, index) => (
                        <TableWrapper key={`row1-${index}`} style={styles.row}>
                          <Cell key={`row2-${index}`} data={rowData.item} textStyle={styles.text} />
                          <Cell key={`row3-${index}`} data={rowData.harga} textStyle={styles.text} />
                          <Cell key={`row4-${index}`} data={element(rowData)} textStyle={styles.text} />
                        </TableWrapper>
                      ))
                    }
                  </Table>
                </View>
              )
              }
              <Mytext text={`Grand Total: ${(Total || 0)}`} />
              <Mybutton disabled={IsAddItemDisable} title="Tambah Item" customClick={() => toggleModal('open')} />
              <Mybutton disabled={IsCreateDisable} title="Simpan Data" customClick={create_transaction} />
              <Mybutton disabled={IsPrintDisable} title="Pembayaran" customClick={() => togglePrintModal()} />
              <Modal isVisible={IsModalVisible}>
                <View style={{ flex: 1, backgroundColor: 'white', justifyContent: 'center' }}>
                  <Mytextinput
                    placeholder="Nama Item"
                    value={Item}
                    onChangeText={(Item) => setItem(Item)}
                    style={{ padding: 10 }}
                  />
                  <Mytextinput
                    placeholder="Harga" 
                    value={Harga}
                    keyboardType={'numeric'} 
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
                    keyboardType={'numeric'} 
                    onChangeText={(Tunai) => {
                      setTunai(Tunai);
                      calcKembali(Tunai);
                    }}
                    style={{ padding: 10 }}
                  />
                  <Mytext text={`Uang Kembali: ${(Kembali || 0)}`} />
                  <Mybutton disabled={IsSelesaiDisable} title="Bayar" customClick={async () => {
                    await storeData();
                    togglePrintModal();
                    navigation.navigate('Print');
                  }} />
                  <Mybutton title="Kembali" customClick={() => setIsModalPrintVisible(!IsModalPrintVisible)} />
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