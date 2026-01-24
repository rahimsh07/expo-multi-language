import TranslationText from '@/components/translationText';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import RenderHtml from 'react-native-render-html';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface User {
    name: string;
    profile_image: string;
}

interface FlareTag {
    name: string;
    bg_color_hex: string;
    text_color_hex: string;
}

interface Article {
    id: number;
    title: string;
    description: string;
    readable_publish_date: string;
    cover_image?: string;
    body_html: string;
    tags: string[];
    user: User;
    flare_tag: FlareTag;
    public_reactions_count: number;
    comments_count: number;
}

const ArticleDetailPage = () => {
    const route = useRoute();
    const { articleId } = route.params as { articleId: string };
    const [article, setArticle] = useState<Article | null>(null);
    const [loading, setLoading] = useState(true);

    const router = useRouter();

    const handleGoBack = () => {
        router.back();
    }

    const fetchArticle = async () => {
        try {
            const res = await fetch(`${process.env.EXPO_PUBLIC_ARTICLE_API_URL}/${articleId}`);
            const data = await res.json();
            setArticle(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchArticle();
    }, [articleId]);

    if (loading) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" color="#2563eb" />
            </View>
        );
    }

    if (!article) {
        return (
            <View style={styles.loader}>
                <Text style={{ color: 'white' }}>Article not found</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* custom header */}
            <View style={styles.header}>
                <MaterialCommunityIcons onPress={handleGoBack} name="chevron-left" size={32} color="white" style={styles.headerBackIcon} />
                <TranslationText style={styles.headerTitle}>Article Detail</TranslationText>
            </View>

            <ScrollView contentContainerStyle={styles.scroll}>
                {/* Cover Image */}
                {article.cover_image && (
                    <Image
                        source={{ uri: article.cover_image }}
                        style={styles.cover}
                        resizeMode="cover"
                    />
                )}

                {/* Title */}
                <TranslationText style={styles.title}>{article.title}</TranslationText>

                {/* Author */}
                <View style={styles.authorRow}>
                    <Image source={{ uri: article.user.profile_image }} style={styles.avatar} />
                    <View>
                        <Text style={styles.authorName}>{article.user.name}</Text>
                        <Text style={styles.date}>{article.readable_publish_date}</Text>
                    </View>
                </View>

                {/* Tags */}
                <View style={styles.tagsContainer}>
                    {article.tags.map((tag) => (
                        <Text key={tag} style={styles.tag}>
                            #{tag}
                        </Text>
                    ))}
                </View>

                {/* Flare Tag */}
                {article.flare_tag && (
                    <View
                        style={[
                            styles.flareTag,
                            { backgroundColor: article.flare_tag.bg_color_hex },
                        ]}
                    >
                        <Text style={{ color: article.flare_tag.text_color_hex }}>
                            {article.flare_tag.name}
                        </Text>
                    </View>
                )}

                {/* Stats */}
                <View style={styles.statsRow}>
                    <Text style={styles.stats}>{article.public_reactions_count} ❤️</Text>
                    <Text style={styles.stats}>{article.comments_count} 💬</Text>
                </View>

                {/* Article Body */}
                <RenderHtml
                    contentWidth={width - 32}
                    ignoredDomTags={['svg', 'iframe']}
                    source={{ html: article.body_html }}
                    tagsStyles={{
                        p: { color: 'white', fontSize: 16, lineHeight: 24 },
                        h1: { color: 'white', fontSize: 24, fontWeight: '700', marginVertical: 8 },
                        h2: { color: 'white', fontSize: 20, fontWeight: '700', marginVertical: 6 },
                        strong: { fontWeight: '700' },
                        em: { fontStyle: 'italic' },
                        ul: { marginVertical: 6, paddingLeft: 20, },
                        li: { color: 'white', fontSize: 16, marginBottom: 4 },
                        a: { color: '#2563eb' },

                        pre: {
                            backgroundColor: '#0f172a',
                            padding: 12,
                            borderRadius: 8,
                            marginVertical: 12,
                        },
                        code: {
                            color: '#e5e7eb',
                            fontSize: 14,
                            fontFamily: 'monospace',
                        },
                    }}
                />
            </ScrollView>
        </SafeAreaView>
    );
};

export default ArticleDetailPage;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212' },
    header: {
        height: 60, justifyContent: 'center', alignItems: 'center',
        borderBottomWidth: 1, borderColor: '#343536'
    },
    headerTitle: { color: 'white', fontSize: 18, fontWeight: '600' },
    headerBackIcon: { position: 'absolute', left: 16 },
    scroll: { padding: 16 },
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    cover: { width: '100%', height: 220, borderRadius: 12, marginBottom: 16 },
    title: { fontSize: 24, fontWeight: '700', color: 'white', marginBottom: 12 },
    authorRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
    authorName: { color: 'white', fontWeight: '600' },
    date: { color: '#888', fontSize: 12 },
    tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
    tag: {
        marginRight: 8,
        marginBottom: 4,
        backgroundColor: '#1e293b',
        color: '#2563eb',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        fontSize: 12,
    },
    flareTag: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 16, marginBottom: 12 },
    statsRow: { flexDirection: 'row', marginBottom: 16 },
    stats: { color: '#888', marginRight: 16 },
});
