import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert
} from 'react-native';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase';

export default function DashboardScreen({ route, navigation }) {
  const { user } = route.params;
  const [salaryData, setSalaryData] = useState(null);
  const [months, setMonths] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [activeTab, setActiveTab] = useState('summary');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadMonths(); }, []);

  const loadMonths = async () => {
    try {
      const q = query(collection(db, 'salaries'), where('id', '==', user.employeeId));
      const snap = await getDocs(q);
      const ms = [];
      snap.forEach(d => ms.push([d.data](http://d.data)().month));
      const sorted = [...new Set(ms)].sort().reverse();
      setMonths(sorted);
      if (sorted.length > 0) {
        setSelectedMonth(sorted[0]);
        loadSalary(sorted[0]);
      } else {
        setLoading(false);
      }
    } catch (e) {
      Alert.alert('خطأ', e.message);
      setLoading(false);
    }
  };

  const loadSalary = async (month) => {
    setLoading(true);
    try {
      const docRef = doc(db, 'salaries', user.employeeId + '_' + month);
      const docSnap = await getDoc(docRef);
      setSalaryData(docSnap.exists() ? [docSnap.data](http://docSnap.data)() : null);
    } catch (e) {
      Alert.alert('خطأ', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigation.replace('Login');
  };

  const fmt = (n) => (n || 0).toLocaleString();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>خروج</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerName} numberOfLines={1}>{[user.name](http://user.name)}</Text>
          <Text style={styles.headerId}>{'#' + user.employeeId}</Text>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{[user.name](http://user.name) ? [user.name](http://user.name).charAt(0) : 'N'}</Text>
        </View>
      </View>

      {months.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.monthsRow}>
          {[months.map](http://months.map)(m => (
            <TouchableOpacity key={m}
              style={[styles.monthBtn, selectedMonth === m && styles.monthBtnActive]}
              onPress={() => { setSelectedMonth(m); loadSalary(m); }}>
              <Text style={[styles.monthText, selectedMonth === m && styles.monthTextActive]}>{m}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {loading ? (
        <View style={[styles.center](http://styles.center)}>
          <ActivityIndicator size="large" color="#10b981" />
        </View>
      ) : salaryData ? (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.statsGrid}>
            <StatCard title="إجمالي الراتب" value={fmt(salaryData.salary) + ' ج.م'} color="#10b981" icon="💰" />
            <StatCard title="أيام العمل" value={(salaryData.workDays || 0) + ' يوم'} color="#3b82f6" icon="📅" />
            <StatCard title="النقلات" value={(salaryData.totalTrips || 0) + ' نقلة'} color="#f59e0b" icon="🚛" />
            <StatCard title="الإضافات" value={fmt(salaryData.totalAdditions) + ' ج.م'} color="#8b5cf6" icon="➕" />
          </View>

          {salaryData.notes ? (
            <View style={styles.notesCard}>
              <Text style={styles.notesTitle}>{'⚠️ ' + salaryData.notes}</Text>
            </View>
          ) : null}

          <View style={styles.tabsCard}>
            <View style={styles.tabs}>
              {[{k:'summary',l:'ملخص'},{k:'additions',l:'الإضافات'}].map(t => (
                <TouchableOpacity key={t.k} style={[[styles.tab](http://styles.tab), activeTab === t.k && styles.tabActive]}
                  onPress={() => setActiveTab(t.k)}>
                  <Text style={[styles.tabText, activeTab === t.k && styles.tabTextActive]}>{t.l}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.tabContent}>
              {activeTab === 'summary' ? (
                <View>
                  {[
                    {l:'أيام العمل', v:(salaryData.workDays||0) + ' يوم'},
                    {l:'أيام الراحة', v:(salaryData.daysOff||0) + ' يوم'},
                    {l:'إجازة مرضية', v:(salaryData.sick||0) + ' يوم