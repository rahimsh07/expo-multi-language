import { useLanguage } from '@/context/languageContext';
import { useTranslateText } from '@/hooks/useLiveTranslation';
import { getCountryByLang } from '@/utils/getCountryByLang';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import CountryFlag from 'react-native-country-flag';
import { SafeAreaView } from 'react-native-safe-area-context';

interface LibreTranslateLanguage {
  code: string;
  name: string;
  targets: Array<string>;
}

export default function LanguageScreen() {
  const [search, setSearch] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [languageCountries, setLanguageCountries] = useState<Array<LibreTranslateLanguage>>([]);

  const router = useRouter();

  const { language, setLanguage } = useLanguage();

  const handleGoBack = useCallback(() => {
    router.back();
  }, [router]);

  const fetchLanguages = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('Fetching languages from API...', Date.now());
      const response = await fetch(`${process.env.EXPO_PUBLIC_LIBRE_TRANSLATE_API_URL}/languages`);

      console.log('Fetched languages:', response.status, Date.now());

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();

      setLanguageCountries(data);
    } catch (error) {
      console.error('Error fetching languages:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchLanguages().finally(() => setRefreshing(false));
  }, [fetchLanguages]);

  const filteredLanguages = useMemo(() => {
    return languageCountries.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, languageCountries]);

  useEffect(() => {
    fetchLanguages();
  }, []);

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <View style={styles.header}>
        <MaterialCommunityIcons onPress={handleGoBack} name="chevron-left" size={32} color="white" style={styles.headerBackIcon} />
        <Text style={styles.headerTitle}>{useTranslateText("Select a Language")}</Text>
      </View>

      <View style={{ flex: 1, padding: 16, gap: 12 }}>
        <View style={styles.searchBox}>
          <MaterialCommunityIcons
            name="magnify"
            size={22}
            color="#9ca3af"
          />

          <TextInput
            placeholder={useTranslateText("Search languages...")}
            placeholderTextColor="#9ca3af"
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
          />

          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <MaterialCommunityIcons
                name="close-circle"
                size={20}
                color="#9ca3af"
              />
            </TouchableOpacity>
          )}
        </View>


        {
          isLoading ?
            (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#ffffff" />
              </View>
            ) : (
              <FlatList
                data={filteredLanguages}
                keyExtractor={(item) => item.code}
                refreshControl={
                  <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }
                renderItem={({ item }) => {
                  const countryCode = getCountryByLang(item.code);
                  const isActive = item.code === language;

                  return (
                    <TouchableOpacity
                      style={[
                        styles.item,
                        isActive && styles.activeItem
                      ]}
                      activeOpacity={0.8}
                      onPress={() => setLanguage(item.code)}
                    >
                      <CountryFlag isoCode={countryCode} size={28} />

                      <View style={{ flex: 1 }}>
                        <Text style={styles.name}>
                          {item.name}
                        </Text>
                        <Text style={styles.code}>
                          {item.code.toUpperCase()}
                        </Text>
                      </View>

                      {isActive && (
                        <MaterialCommunityIcons
                          name="check-circle"
                          size={22}
                          color="#22c55e"
                        />
                      )}
                    </TouchableOpacity>
                  );
                }}

                contentContainerStyle={styles.list}
              />
            )
        }
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    height: 60, justifyContent: 'center', alignItems: 'center',
    borderBottomWidth: 1, borderColor: '#343536'
  },
  headerTitle: { color: 'white', fontSize: 18, fontWeight: '600' },
  headerBackIcon: { position: 'absolute', left: 16 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f2937',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 52,
    gap: 8
  },

  searchInput: {
    flex: 1,
    color: 'white',
    fontSize: 16
  },
  list: {
    paddingBottom: 40,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#1e293b',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },

  activeItem: {
    borderWidth: 1,
    borderColor: '#22c55e'
  },

  name: {
    fontSize: 16,
    color: 'white',
  },

  code: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2
  },
});
