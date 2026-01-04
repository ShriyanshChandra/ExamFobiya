import { db } from '../firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

export const fetchAnalyticsData = async () => {
    try {
        // 1. Fetch Total Books
        const booksCol = collection(db, 'books');
        const booksSnapshot = await getDocs(booksCol);
        const totalBooks = booksSnapshot.size;

        // 2. Fetch Total Users
        const usersCol = collection(db, 'users');
        const usersSnapshot = await getDocs(usersCol);
        const totalUsers = usersSnapshot.size;

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
        const trafficData = [
            { name: 'Mon', visits: totalVisits - 45 > 0 ? totalVisits - 45 : 10 },
            { name: 'Tue', visits: totalVisits - 38 > 0 ? totalVisits - 38 : 22 },
            { name: 'Wed', visits: totalVisits - 25 > 0 ? totalVisits - 25 : 35 },
            { name: 'Thu', visits: totalVisits - 15 > 0 ? totalVisits - 15 : 48 },
            { name: 'Fri', visits: totalVisits - 8 > 0 ? totalVisits - 8 : 55 },
            { name: 'Sat', visits: totalVisits - 2 > 0 ? totalVisits - 2 : 62 },
            { name: 'Sun', visits: totalVisits } // Current
        ];

        return {
            totalBooks,
            totalUsers,
            totalVisits,
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
