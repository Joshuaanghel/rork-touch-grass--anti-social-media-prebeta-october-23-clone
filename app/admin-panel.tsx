import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Share,
} from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Database, Download, Users, MessageSquare, Lock, ChevronRight } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { trpc } from '@/lib/trpc';

export default function AdminPanelScreen() {
  const insets = useSafeAreaInsets();
  const [showData, setShowData] = useState(false);
  
  const { data: exportData, isLoading, refetch } = trpc.admin.export.useQuery(undefined, {
    enabled: showData,
  });

  const handleExportData = async () => {
    if (!exportData) {
      Alert.alert('Error', 'No data available');
      return;
    }

    const formattedData = JSON.stringify(exportData, null, 2);
    
    try {
      await Share.share({
        message: formattedData,
        title: 'Touch Grass Admin Data Export',
      });
    } catch (error) {
      console.error('Error sharing data:', error);
      Alert.alert('Export', 'Data logged to console. Check browser/terminal logs.');
      console.log('===== ADMIN DATA EXPORT =====');
      console.log(formattedData);
      console.log('=============================');
    }
  };

  const handleLoadData = () => {
    setShowData(true);
  };

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Admin Panel',
          headerStyle: {
            backgroundColor: Colors.dark.background,
          },
          headerTintColor: Colors.dark.text,
          headerBackTitle: 'Back',
        }} 
      />
      <LinearGradient
        colors={[Colors.dark.background, Colors.dark.accent]}
        style={[styles.container, { paddingBottom: insets.bottom }]}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Database size={48} color={Colors.dark.primaryLight} />
            </View>
            <Text style={styles.title}>Admin Dashboard</Text>
            <Text style={styles.subtitle}>
              Access all user data, emails, and feedback responses
            </Text>
          </View>

          <View style={styles.warningCard}>
            <Lock size={24} color="#F59E0B" />
            <Text style={styles.warningText}>
              This panel provides access to sensitive user data. Only use for administrative purposes.
            </Text>
          </View>

          {exportData && (
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Users size={32} color={Colors.dark.primaryLight} />
                <Text style={styles.statNumber}>{exportData.users.length}</Text>
                <Text style={styles.statLabel}>Total Users</Text>
              </View>
              <View style={styles.statCard}>
                <MessageSquare size={32} color={Colors.dark.primaryLight} />
                <Text style={styles.statNumber}>{exportData.feedbackResponses.length}</Text>
                <Text style={styles.statLabel}>Feedback Submitted</Text>
              </View>
            </View>
          )}

          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleLoadData}
              disabled={isLoading}
            >
              <LinearGradient
                colors={['#8B5CF6', '#7C3AED']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.actionButtonGradient}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Database size={24} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>Load Data</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {exportData && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleExportData}
              >
                <LinearGradient
                  colors={['#059669', '#10B981']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.actionButtonGradient}
                >
                  <Download size={24} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>Export/Share Data</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>

          {exportData && (
            <>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>User Emails ({exportData.userAuth.length})</Text>
                <View style={styles.dataList}>
                  {exportData.userAuth.map((auth, index) => (
                    <View key={index} style={styles.dataItem}>
                      <Text style={styles.dataEmail}>{auth.email}</Text>
                      <Text style={styles.dataDate}>
                        {new Date(auth.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>User Profiles ({exportData.users.length})</Text>
                <View style={styles.dataList}>
                  {exportData.users.map((user, index) => (
                    <View key={index} style={styles.dataItem}>
                      <View style={styles.userInfo}>
                        <Text style={styles.userName}>{user.name}</Text>
                        <Text style={styles.userPersonality}>{user.personalityType}</Text>
                      </View>
                      <ChevronRight size={20} color={Colors.dark.textSecondary} />
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  Feedback Responses ({exportData.feedbackResponses.length})
                </Text>
                <View style={styles.dataList}>
                  {exportData.feedbackResponses.map((feedback, index) => (
                    <View key={index} style={styles.feedbackItem}>
                      <View style={styles.feedbackHeader}>
                        <Text style={styles.feedbackEmail}>{feedback.userEmail}</Text>
                        <Text style={styles.feedbackDate}>
                          {new Date(feedback.submittedAt).toLocaleDateString()}
                        </Text>
                      </View>
                      <View style={styles.feedbackAnswers}>
                        {Object.entries(feedback.answers).map(([qIndex, answer]) => (
                          <View key={qIndex} style={styles.answerRow}>
                            <Text style={styles.answerLabel}>Q{parseInt(qIndex) + 1}:</Text>
                            <Text style={styles.answerText} numberOfLines={2}>
                              {answer}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  Quiz Responses ({exportData.quizResponses.length})
                </Text>
                <View style={styles.dataList}>
                  {exportData.quizResponses.map((quiz, index) => (
                    <View key={index} style={styles.dataItem}>
                      <View style={styles.userInfo}>
                        <Text style={styles.userName}>{quiz.userName}</Text>
                        <Text style={styles.userPersonality}>{quiz.personalityType}</Text>
                        <Text style={styles.quizDate}>
                          {quiz.answers.length} questions answered
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.exportInfo}>
                <Text style={styles.exportInfoText}>
                  Data exported at: {new Date(exportData.exportedAt).toLocaleString()}
                </Text>
                <TouchableOpacity onPress={() => refetch()}>
                  <Text style={styles.refreshText}>Refresh Data</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </ScrollView>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: Colors.dark.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
  },
  warningCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    gap: 12,
    alignItems: 'center',
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: Colors.dark.text,
    lineHeight: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.dark.glass,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    alignItems: 'center',
    gap: 8,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '900' as const,
    color: Colors.dark.primaryLight,
  },
  statLabel: {
    fontSize: 13,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
  },
  actionsContainer: {
    gap: 12,
    marginBottom: 32,
  },
  actionButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 18,
  },
  actionButtonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.dark.text,
    marginBottom: 12,
  },
  dataList: {
    gap: 8,
  },
  dataItem: {
    backgroundColor: Colors.dark.glass,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dataEmail: {
    fontSize: 15,
    color: Colors.dark.text,
    fontWeight: '600' as const,
    flex: 1,
  },
  dataDate: {
    fontSize: 13,
    color: Colors.dark.textSecondary,
  },
  userInfo: {
    flex: 1,
    gap: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.dark.text,
  },
  userPersonality: {
    fontSize: 14,
    color: Colors.dark.primaryLight,
  },
  quizDate: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
  },
  feedbackItem: {
    backgroundColor: Colors.dark.glass,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    gap: 12,
  },
  feedbackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  feedbackEmail: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.dark.text,
  },
  feedbackDate: {
    fontSize: 13,
    color: Colors.dark.textSecondary,
  },
  feedbackAnswers: {
    gap: 8,
  },
  answerRow: {
    flexDirection: 'row',
    gap: 8,
  },
  answerLabel: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.dark.primaryLight,
    width: 30,
  },
  answerText: {
    flex: 1,
    fontSize: 13,
    color: Colors.dark.textSecondary,
    lineHeight: 18,
  },
  exportInfo: {
    backgroundColor: Colors.dark.glass,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    alignItems: 'center',
    gap: 12,
  },
  exportInfoText: {
    fontSize: 13,
    color: Colors.dark.textSecondary,
  },
  refreshText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.dark.primaryLight,
  },
});
