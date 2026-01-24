import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ThemedText } from "@/components/themed-text";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FlatList, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

const flags = [
    { lang: "pt-BR", name: "Brasil" },
    { lang: "en-US", name: "USA" },
    { lang: "zh-CN", name: "China" },
];

export function Language() {
    const { i18n, t } = useTranslation();
    const currentLanguage = i18n.language;

    useEffect(() => {
        const loadLanguage = async () => {
            const savedLanguage = await AsyncStorage.getItem("language");
            if (savedLanguage) {
                i18n.changeLanguage(savedLanguage);
            }
        };
        loadLanguage();
    }, [i18n]);

    const changeLanguage = async (lang: string) => {
        await AsyncStorage.setItem("language", lang);
        i18n.changeLanguage(lang);
    };

    return (
        <View style={styles.container}>
            <ThemedText style={styles.text}>{t('language')}</ThemedText>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.flagsContainer}
            >
                <FlatList
                    keyExtractor={(item) => item.lang}
                    data={flags} renderItem={({ item }) =>
                        <TouchableOpacity
                            onPress={() => changeLanguage(item.lang)}
                            style={[
                                styles.flag,
                                currentLanguage === item.lang && styles.activeFlag,
                                currentLanguage !== item.lang && styles.inactiveFlag,
                            ]}
                        >
                            <ThemedText style={styles.text}>{item.name}</ThemedText>
                        </TouchableOpacity>
                    } />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        justifyContent: "center",
    },
    flagsContainer: {
        flexDirection: "row",
        paddingVertical: 10,
    },
    flag: {
        paddingHorizontal: 10,
    },
    activeFlag: {
        transform: [{ scale: 1.2 }],
    },
    inactiveFlag: {
        opacity: 0.5,
    },
    text: {
        fontSize: 22,
        lineHeight: 32,
        marginTop: -6,
    },
});