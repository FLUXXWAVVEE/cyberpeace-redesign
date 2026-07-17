// api.js - Production-Ready Modular API Service

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8080/api'
    : 'https://cyberpeace-backend-production.up.railway.app/api';

// Toggle to simulate real backend or mock service (for testing/demo)
const USE_MOCK = false;

/**
 * Reusable fetch wrapper with error handling, timeouts, and headers setup.
 */
async function request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    
    // Set default headers
    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers
    };

    const config = {
        method: 'GET',
        ...options,
        headers
    };

    if (config.body && typeof config.body === 'object') {
        config.body = JSON.stringify(config.body);
    }

    try {
        const response = await fetch(url, config);
        if (!response.ok) {
            const errBody = await response.json().catch(() => ({}));
            throw new Error(errBody.message || `HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`[API Error] Request failed on ${url}:`, error);
        throw error;
    }
}

/**
 * Mock response simulator to emulate network latency and standard responses.
 */
function simulateMockRequest(endpoint, payload, mockSuccessResponse) {
    console.log(`[API Mock Request] POST ${endpoint}`, payload);
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // 2% chance of simulated network drop for testing robust error handling
            if (Math.random() < 0.02) {
                reject(new Error("Network connection timeout. Please check your internet connection and try again."));
            } else {
                resolve(mockSuccessResponse);
            }
        }, 1200); // Realistic 1.2s delay
    });
}

// Reusable Service Calls
window.apiService = {
    // 1. Submit Contact Form
    async submitContact(data) {
        if (USE_MOCK) {
            return simulateMockRequest('/contact', data, {
                success: true,
                message: "Thank you for reaching out! A representative will contact you shortly."
            });
        }
        return request('/contact', { method: 'POST', body: data });
    },

    // 2. Submit Newsletter Subscription Form
    async submitNewsletter(email) {
        if (USE_MOCK) {
            return simulateMockRequest('/newsletter', { email }, {
                success: true,
                message: "Subscribed successfully! Welcome to the CyberPeace Newsletter."
            });
        }
        return request('/newsletter', { method: 'POST', body: { email } });
    },

    // 3. Submit Grievance Form
    async submitGrievance(data) {
        if (USE_MOCK) {
            return simulateMockRequest('/grievances', data, {
                success: true,
                message: "Your grievance report has been successfully recorded. Reference ID: CP-" + Math.floor(100000 + Math.random() * 900000)
            });
        }
        return request('/grievances', { method: 'POST', body: data });
    },

    // 4. Submit Volunteer Application Form
    async submitVolunteer(data) {
        if (USE_MOCK) {
            return simulateMockRequest('/volunteer', data, {
                success: true,
                message: "Thank you for showing interest in the CyberPeace Corps! Our recruitment team will review your application."
            });
        }
        return request('/volunteer', { method: 'POST', body: data });
    },

    // 5. Submit General Interest Form (Engage)
    async submitInterest(data) {
        if (USE_MOCK) {
            return simulateMockRequest('/interest', data, {
                success: true,
                message: "Your interest has been logged. We will connect you with our project leads soon."
            });
        }
        return request('/interest', { method: 'POST', body: data });
    },

    // 6. Submit Old Tech Kind Donation Form (Support Us)
    async submitKindDonation(data) {
        if (USE_MOCK) {
            return simulateMockRequest('/donate-kind', data, {
                success: true,
                message: "Thank you for your generous tech donation! Our sanitization team will contact you for pickup."
            });
        }
        return request('/donate-kind', { method: 'POST', body: data });
    },

    // 7. Submit Sponsorship Request Form (Support Us)
    async submitSponsorship(data) {
        if (USE_MOCK) {
            return simulateMockRequest('/sponsor', data, {
                success: true,
                message: "Sponsorship interest successfully logged. Our outreach coordinator will email you proposal docs."
            });
        }
        return request('/sponsor', { method: 'POST', body: data });
    },

    // 8. Fetch Blogs (Dynamic Loading/Filtering)
    async fetchBlogs(filters = {}) {
        if (USE_MOCK) {
            // Emulate client filtering on static mock dataset
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve({
                        success: true,
                        blogs: [] // Loaded by client script from local static/mock arrays for static demo
                    });
                }, 400);
            });
        }
        const queryParams = new URLSearchParams(filters).toString();
        return request(`/blogs?${queryParams}`);
    },

    // 9. Fetch Events
    async fetchEvents(filters = {}) {
        if (USE_MOCK) {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve({ success: true, events: [] });
                }, 400);
            });
        }
        const queryParams = new URLSearchParams(filters).toString();
        return request(`/events?${queryParams}`);
    }
};
