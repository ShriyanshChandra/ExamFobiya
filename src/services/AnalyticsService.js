import { db } from '../firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

export const fetchAnalyticsData = async () => {
    try {
        // Helper to check if date is within last 7 days
        const isRecent = (dateString) => {
            if (!dateString) return false;
            const date = new Date(dateString); // Firestore timestamp or ISO string
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            return date > sevenDaysAgo;
        };

        const calculateGrowth = (current, previous) => {
            if (previous === 0) return current > 0 ? 100 : 0;
            return ((current - previous) / previous) * 100;
        };

        // 1. Fetch Total Books & Growth
        const booksCol = collection(db, 'books');
        const booksSnapshot = await getDocs(booksCol);
        const totalBooks = booksSnapshot.size;

        // Count new books (last 7 days)
        let newBooksCount = 0;
        booksSnapshot.forEach(doc => {
            const data = doc.data();
            // Check createdAt (handle Firestore Timestamp or String)
            const created = data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt;
            if (isRecent(created)) newBooksCount++;
        });


        // 2. Fetch Total Users & Growth
        const usersCol = collection(db, 'users');
        const usersSnapshot = await getDocs(usersCol);
        const totalUsers = usersSnapshot.size;

        // Calculate User Growth
        let newUsersCount = 0;
        usersSnapshot.forEach(doc => {
            const data = doc.data();
            const created = data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt;
            if (isRecent(created)) newUsersCount++;
        });

        const previousUsers = totalUsers - newUsersCount;
        const userGrowthPercentage = previousUsers > 0 ? ((newUsersCount / previousUsers) * 100).toFixed(1) : 100;

        // 3. Fetch Visit Count
        const statsDocRef = doc(db, 'stats', 'general');
        const statsDoc = await getDoc(statsDocRef);
        const totalVisits = statsDoc.exists() ? statsDoc.data().visit_count || 0 : 0;

        // 4. Calculate Genre Distribution (Client-side aggregation)
        const genreCounts = {};
        booksSnapshot.docs.forEach(doc => {
            const book = doc.data();
            const genre = book.genre || book.category || 'Uncategorized'; // Adjust field name based on actual data
            genreCounts[genre] = (genreCounts[genre] || 0) + 1;
        });

        const genreData = Object.keys(genreCounts).map(genre => ({
            name: genre,
            value: genreCounts[genre]
        }));

        // 5. Generate Mock Traffic Data (Last 7 Days)
        // 5. Fetch Real Daily Traffic Data (Last 7 Days)
        const trafficData = [];
        const today = new Date();
        const daysToFetch = 7;

        for (let i = daysToFetch - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

            // Format ID as YYYY-MM-DD to match storage (Local Time)
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const docId = `${year}-${month}-${day}`;

            console.log("Fetching stats for:", docId); // Debug log

            const dailyDocRef = doc(db, 'daily_stats', docId);

            // We fetch each day individually. For 7 days this is okay.
            // In a larger app, you'd query a range.
            try {
                const dailySnapshot = await getDoc(dailyDocRef);
                const visits = dailySnapshot.exists() ? dailySnapshot.data().visits : 0;

                trafficData.push({
                    name: dateStr,
                    visits: visits
                });
            } catch (err) {
                console.warn(`Could not fetch stats for ${docId}`, err);
                trafficData.push({ name: dateStr, visits: 0 });
            }
        }

        // 6. Fetch Previous Week's Visits (Days 8-14 ago) for Growth calc
        let sumCurrentWeek = trafficData.reduce((acc, curr) => acc + curr.visits, 0);
        let sumPreviousWeek = 0;

        for (let i = 14; i >= 7; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const docId = `${year}-${month}-${day}`;

            try {
                const dailyDocRef = doc(db, 'daily_stats', docId);
                const dailySnapshot = await getDoc(dailyDocRef);
                if (dailySnapshot.exists()) {
                    sumPreviousWeek += dailySnapshot.data().visits || 0;
                }
            } catch (e) {
                // Ignore errors for historical data
            }
        }

        const visitGrowthPercentage = calculateGrowth(sumCurrentWeek, sumPreviousWeek).toFixed(1);

        return {
            totalBooks,
            newBooksCount, // New field
            totalUsers,
            userGrowthPercentage, // New field
            totalVisits,
            visitGrowthPercentage, // Real calculated growth
            genreData,
            trafficData
        };
    } catch (error) {
        console.error("Error fetching analytics data:", error);
        return {
            totalBooks: 0,
            totalUsers: 0,
            totalVisits: 0,
            genreData: [],
            trafficData: []
        };
    }
};
