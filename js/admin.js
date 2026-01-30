// ===== Admin Panel JavaScript =====

const API_BASE = '/api';
let authToken = localStorage.getItem('adminToken');
let currentApplicationId = null;

// ===== DOM Elements =====
const loginContainer = document.getElementById('loginContainer');
const adminContainer = document.getElementById('adminContainer');
const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logoutBtn');
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.querySelector('.admin-sidebar');

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupEventListeners();
});

// ===== Authentication =====
function checkAuth() {
    if (authToken) {
        showAdminPanel();
        loadDashboard();
    } else {
        showLoginForm();
    }
}

function showLoginForm() {
    loginContainer.style.display = 'flex';
    adminContainer.style.display = 'none';
}

function showAdminPanel() {
    loginContainer.style.display = 'none';
    adminContainer.style.display = 'flex';
}

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            authToken = data.data.token;
            localStorage.setItem('adminToken', authToken);
            localStorage.setItem('adminUser', JSON.stringify(data.data.user));
            
            document.getElementById('adminName').textContent = data.data.user.name;
            
            showToast('Login successful!');
            showAdminPanel();
            loadDashboard();
        } else {
            showToast(data.message || 'Login failed', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showToast('Login failed. Please try again.', 'error');
    }
});

logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    authToken = null;
    showLoginForm();
    showToast('Logged out successfully');
});

// ===== API Helper =====
async function apiRequest(endpoint, method = 'GET', data = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        }
    };
    
    if (data) {
        options.body = JSON.stringify(data);
    }
    
    const response = await fetch(`${API_BASE}${endpoint}`, options);
    return await response.json();
}

// ===== Navigation =====
function setupEventListeners() {
    // Sidebar navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.dataset.section;
            showSection(section);
            
            // Update active state
            document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            
            // Close sidebar on mobile
            sidebar.classList.remove('open');
        });
    });
    
    // Mobile menu toggle
    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });
    
    // Filters
    document.getElementById('statusFilter')?.addEventListener('change', loadApplications);
    document.getElementById('positionFilter')?.addEventListener('change', loadApplications);
    document.getElementById('searchFilter')?.addEventListener('input', debounce(loadApplications, 500));
    
    // Forms
    document.getElementById('eventForm')?.addEventListener('submit', handleEventSubmit);
    document.getElementById('newsForm')?.addEventListener('submit', handleNewsSubmit);
    document.getElementById('memberForm')?.addEventListener('submit', handleMemberSubmit);
}

function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    const section = document.getElementById(`${sectionName}Section`);
    if (section) {
        section.classList.add('active');
        document.getElementById('sectionTitle').textContent = 
            sectionName.charAt(0).toUpperCase() + sectionName.slice(1);
        
        // Load section data
        switch (sectionName) {
            case 'dashboard': loadDashboard(); break;
            case 'applications': loadApplications(); break;
            case 'events': loadEvents(); break;
            case 'news': loadNews(); break;
            case 'members': loadMembers(); break;
            case 'contacts': loadContacts(); break;
        }
    }
}

// ===== Dashboard =====
async function loadDashboard() {
    try {
        // Load stats
        const statsData = await apiRequest('/admin/dashboard');
        if (statsData.success) {
            const stats = statsData.data;
            document.getElementById('totalApplications').textContent = stats.applications.total;
            document.getElementById('pendingApplications').textContent = stats.applications.pending;
            document.getElementById('upcomingEvents').textContent = stats.events.upcoming;
            document.getElementById('totalMembers').textContent = stats.members.active;
            
            document.getElementById('appBadge').textContent = stats.applications.pending;
            document.getElementById('contactBadge').textContent = stats.contacts.unread;
        }
        
        // Load recent applications
        const appsData = await apiRequest('/applications?limit=5');
        if (appsData.success) {
            const container = document.getElementById('recentApplications');
            if (appsData.data.applications.length > 0) {
                container.innerHTML = appsData.data.applications.map(app => `
                    <div class="recent-app-item" style="padding: 10px 0; border-bottom: 1px solid var(--border-color);">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <strong>${app.fullName}</strong>
                                <span style="color: #666; font-size: 0.85rem;"> - ${getPositionLabel(app.position)}</span>
                            </div>
                            <span class="status-badge ${app.status}">${app.status}</span>
                        </div>
                        <div style="font-size: 0.85rem; color: #666; margin-top: 5px;">
                            ${formatDate(app.submittedAt)}
                        </div>
                    </div>
                `).join('');
            } else {
                container.innerHTML = '<p>No recent applications</p>';
            }
        }
    } catch (error) {
        console.error('Dashboard load error:', error);
    }
}

// ===== Applications =====
async function loadApplications() {
    const status = document.getElementById('statusFilter')?.value || '';
    const position = document.getElementById('positionFilter')?.value || '';
    const search = document.getElementById('searchFilter')?.value || '';
    
    try {
        const data = await apiRequest(`/applications?status=${status}&position=${position}&search=${search}`);
        
        if (data.success) {
            const tbody = document.getElementById('applicationsBody');
            
            if (data.data.applications.length > 0) {
                tbody.innerHTML = data.data.applications.map(app => `
                    <tr>
                        <td>${app.applicationId}</td>
                        <td>${app.fullName}</td>
                        <td>${app.email}</td>
                        <td>${app.department}</td>
                        <td>${getPositionLabel(app.position)}</td>
                        <td><span class="status-badge ${app.status}">${app.status}</span></td>
                        <td>${formatDate(app.submittedAt)}</td>
                        <td>
                            <button class="action-btn view" onclick="viewApplication('${app._id || app.applicationId}')">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="action-btn delete" onclick="deleteApplication('${app._id || app.applicationId}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `).join('');
            } else {
                tbody.innerHTML = '<tr><td colspan="8" style="text-align: center;">No applications found</td></tr>';
            }
        }
    } catch (error) {
        console.error('Load applications error:', error);
    }
}

async function viewApplication(id) {
    try {
        const data = await apiRequest(`/applications/${id}`);
        
        if (data.success) {
            const app = data.data;
            currentApplicationId = id;
            
            document.getElementById('applicationDetails').innerHTML = `
                <div class="detail-grid">
                    <div class="detail-item">
                        <label>Application ID</label>
                        <span>${app.applicationId}</span>
                    </div>
                    <div class="detail-item">
                        <label>Status</label>
                        <span class="status-badge ${app.status}">${app.status}</span>
                    </div>
                    <div class="detail-item">
                        <label>Full Name</label>
                        <span>${app.fullName}</span>
                    </div>
                    <div class="detail-item">
                        <label>Email</label>
                        <span>${app.email}</span>
                    </div>
                    <div class="detail-item">
                        <label>Phone</label>
                        <span>${app.phone}</span>
                    </div>
                    <div class="detail-item">
                        <label>Roll Number</label>
                        <span>${app.rollNo}</span>
                    </div>
                    <div class="detail-item">
                        <label>Department</label>
                        <span>${app.department}</span>
                    </div>
                    <div class="detail-item">
                        <label>Year</label>
                        <span>${app.year}</span>
                    </div>
                    <div class="detail-item">
                        <label>Position Applied</label>
                        <span>${getPositionLabel(app.position)}</span>
                    </div>
                    <div class="detail-item">
                        <label>Submitted On</label>
                        <span>${formatDate(app.submittedAt)}</span>
                    </div>
                    <div class="detail-item full-width">
                        <label>Skills</label>
                        <span>${app.skills || 'Not provided'}</span>
                    </div>
                    <div class="detail-item full-width">
                        <label>Motivation</label>
                        <span>${app.motivation}</span>
                    </div>
                    ${app.linkedin ? `<div class="detail-item"><label>LinkedIn</label><a href="${app.linkedin}" target="_blank">${app.linkedin}</a></div>` : ''}
                    ${app.github ? `<div class="detail-item"><label>GitHub</label><a href="${app.github}" target="_blank">${app.github}</a></div>` : ''}
                </div>
            `;
            
            document.getElementById('applicationStatus').value = app.status;
            openModal('applicationModal');
        }
    } catch (error) {
        console.error('View application error:', error);
        showToast('Error loading application', 'error');
    }
}

async function updateApplicationStatus() {
    const status = document.getElementById('applicationStatus').value;
    
    try {
        const data = await apiRequest(`/applications/${currentApplicationId}`, 'PUT', { status });
        
        if (data.success) {
            showToast('Application status updated');
            closeModal('applicationModal');
            loadApplications();
            loadDashboard();
        } else {
            showToast(data.message || 'Update failed', 'error');
        }
    } catch (error) {
        console.error('Update error:', error);
        showToast('Error updating application', 'error');
    }
}

async function deleteApplication(id) {
    if (!confirm('Are you sure you want to delete this application?')) return;
    
    try {
        const data = await apiRequest(`/applications/${id}`, 'DELETE');
        
        if (data.success) {
            showToast('Application deleted');
            loadApplications();
            loadDashboard();
        } else {
            showToast(data.message || 'Delete failed', 'error');
        }
    } catch (error) {
        console.error('Delete error:', error);
        showToast('Error deleting application', 'error');
    }
}

function exportApplications() {
    showToast('Export feature coming soon!');
}

// ===== Events =====
async function loadEvents() {
    try {
        const data = await apiRequest('/events');
        
        if (data.success) {
            const grid = document.getElementById('eventsGrid');
            
            if (data.data.events.length > 0) {
                grid.innerHTML = data.data.events.map(event => `
                    <div class="item-card">
                        ${event.image ? `<div class="item-card-image"><img src="${event.image}" alt="${event.title}"></div>` : ''}
                        <div class="item-card-content">
                            <h4>${event.title}</h4>
                            <p><i class="fas fa-calendar"></i> ${formatDate(event.date)}</p>
                            <p><i class="fas fa-map-marker-alt"></i> ${event.venue || 'TBA'}</p>
                            <div class="item-card-actions">
                                <button class="action-btn edit" onclick="editEvent('${event._id}')">
                                    <i class="fas fa-edit"></i> Edit
                                </button>
                                <button class="action-btn delete" onclick="deleteEvent('${event._id}')">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('');
            } else {
                grid.innerHTML = '<p>No events found. Click "Add Event" to create one.</p>';
            }
        }
    } catch (error) {
        console.error('Load events error:', error);
    }
}

async function handleEventSubmit(e) {
    e.preventDefault();
    
    const eventData = {
        title: document.getElementById('eventTitle').value,
        eventType: document.getElementById('eventType').value,
        date: document.getElementById('eventDate').value,
        time: document.getElementById('eventTime').value,
        venue: document.getElementById('eventVenue').value,
        description: document.getElementById('eventDescription').value,
        image: document.getElementById('eventImage').value,
        isFeatured: document.getElementById('eventFeatured').checked,
        isOnline: document.getElementById('eventOnline').checked
    };
    
    const eventId = document.getElementById('eventId').value;
    
    try {
        const endpoint = eventId ? `/events/${eventId}` : '/events';
        const method = eventId ? 'PUT' : 'POST';
        
        const data = await apiRequest(endpoint, method, eventData);
        
        if (data.success) {
            showToast(`Event ${eventId ? 'updated' : 'created'} successfully`);
            closeModal('eventModal');
            document.getElementById('eventForm').reset();
            document.getElementById('eventId').value = '';
            loadEvents();
        } else {
            showToast(data.message || 'Error saving event', 'error');
        }
    } catch (error) {
        console.error('Event submit error:', error);
        showToast('Error saving event', 'error');
    }
}

async function deleteEvent(id) {
    if (!confirm('Are you sure you want to delete this event?')) return;
    
    try {
        const data = await apiRequest(`/events/${id}`, 'DELETE');
        
        if (data.success) {
            showToast('Event deleted');
            loadEvents();
        } else {
            showToast(data.message || 'Delete failed', 'error');
        }
    } catch (error) {
        showToast('Error deleting event', 'error');
    }
}

// ===== News =====
async function loadNews() {
    try {
        const data = await apiRequest('/news?published=');
        
        if (data.success) {
            const grid = document.getElementById('newsGrid');
            
            if (data.data.news.length > 0) {
                grid.innerHTML = data.data.news.map(news => `
                    <div class="item-card">
                        ${news.image ? `<div class="item-card-image"><img src="${news.image}" alt="${news.title}"></div>` : ''}
                        <div class="item-card-content">
                            <h4>${news.title}</h4>
                            <p><i class="fas fa-calendar"></i> ${formatDate(news.publishedAt)}</p>
                            <p><i class="fas fa-tag"></i> ${news.category}</p>
                            <div class="item-card-actions">
                                <button class="action-btn edit" onclick="editNews('${news._id}')">
                                    <i class="fas fa-edit"></i> Edit
                                </button>
                                <button class="action-btn delete" onclick="deleteNews('${news._id}')">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('');
            } else {
                grid.innerHTML = '<p>No news found. Click "Add News" to create one.</p>';
            }
        }
    } catch (error) {
        console.error('Load news error:', error);
    }
}

async function handleNewsSubmit(e) {
    e.preventDefault();
    
    const newsData = {
        title: document.getElementById('newsTitle').value,
        category: document.getElementById('newsCategory').value,
        source: document.getElementById('newsSource').value,
        content: document.getElementById('newsContent').value,
        image: document.getElementById('newsImage').value,
        isPublished: document.getElementById('newsPublished').checked,
        isFeatured: document.getElementById('newsFeatured').checked
    };
    
    const newsId = document.getElementById('newsId').value;
    
    try {
        const endpoint = newsId ? `/news/${newsId}` : '/news';
        const method = newsId ? 'PUT' : 'POST';
        
        const data = await apiRequest(endpoint, method, newsData);
        
        if (data.success) {
            showToast(`News ${newsId ? 'updated' : 'created'} successfully`);
            closeModal('newsModal');
            document.getElementById('newsForm').reset();
            document.getElementById('newsId').value = '';
            loadNews();
        } else {
            showToast(data.message || 'Error saving news', 'error');
        }
    } catch (error) {
        showToast('Error saving news', 'error');
    }
}

async function deleteNews(id) {
    if (!confirm('Are you sure you want to delete this news?')) return;
    
    try {
        const data = await apiRequest(`/news/${id}`, 'DELETE');
        
        if (data.success) {
            showToast('News deleted');
            loadNews();
        } else {
            showToast(data.message || 'Delete failed', 'error');
        }
    } catch (error) {
        showToast('Error deleting news', 'error');
    }
}

// ===== Members =====
async function loadMembers() {
    try {
        const data = await apiRequest('/members?active=');
        
        if (data.success) {
            const grid = document.getElementById('membersGrid');
            
            if (data.data.length > 0) {
                grid.innerHTML = data.data.map(member => `
                    <div class="item-card">
                        ${member.image ? `<div class="item-card-image"><img src="${member.image}" alt="${member.name}"></div>` : ''}
                        <div class="item-card-content">
                            <h4>${member.name}</h4>
                            <p><i class="fas fa-user-tag"></i> ${member.position}</p>
                            <p><i class="fas fa-users"></i> ${member.team}</p>
                            <div class="item-card-actions">
                                <button class="action-btn edit" onclick="editMember('${member._id}')">
                                    <i class="fas fa-edit"></i> Edit
                                </button>
                                <button class="action-btn delete" onclick="deleteMember('${member._id}')">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('');
            } else {
                grid.innerHTML = '<p>No members found. Click "Add Member" to create one.</p>';
            }
        }
    } catch (error) {
        console.error('Load members error:', error);
    }
}

async function handleMemberSubmit(e) {
    e.preventDefault();
    
    const memberData = {
        name: document.getElementById('memberName').value,
        position: document.getElementById('memberPosition').value,
        team: document.getElementById('memberTeam').value,
        department: document.getElementById('memberDepartment').value,
        bio: document.getElementById('memberBio').value,
        image: document.getElementById('memberImage').value,
        socialLinks: {
            linkedin: document.getElementById('memberLinkedin').value
        }
    };
    
    const memberId = document.getElementById('memberId').value;
    
    try {
        const endpoint = memberId ? `/members/${memberId}` : '/members';
        const method = memberId ? 'PUT' : 'POST';
        
        const data = await apiRequest(endpoint, method, memberData);
        
        if (data.success) {
            showToast(`Member ${memberId ? 'updated' : 'added'} successfully`);
            closeModal('memberModal');
            document.getElementById('memberForm').reset();
            document.getElementById('memberId').value = '';
            loadMembers();
        } else {
            showToast(data.message || 'Error saving member', 'error');
        }
    } catch (error) {
        showToast('Error saving member', 'error');
    }
}

async function deleteMember(id) {
    if (!confirm('Are you sure you want to delete this member?')) return;
    
    try {
        const data = await apiRequest(`/members/${id}`, 'DELETE');
        
        if (data.success) {
            showToast('Member deleted');
            loadMembers();
        } else {
            showToast(data.message || 'Delete failed', 'error');
        }
    } catch (error) {
        showToast('Error deleting member', 'error');
    }
}

// ===== Contacts =====
async function loadContacts() {
    try {
        const data = await apiRequest('/contact');
        
        if (data.success) {
            const list = document.getElementById('contactsList');
            
            if (data.data.contacts.length > 0) {
                list.innerHTML = data.data.contacts.map(contact => `
                    <div class="message-card ${contact.status === 'new' ? 'unread' : ''}">
                        <div class="message-icon">
                            <i class="fas fa-envelope"></i>
                        </div>
                        <div class="message-content">
                            <h4>${contact.subject}</h4>
                            <div class="meta">
                                <span><i class="fas fa-user"></i> ${contact.name}</span>
                                <span><i class="fas fa-envelope"></i> ${contact.email}</span>
                                <span><i class="fas fa-clock"></i> ${formatDate(contact.createdAt)}</span>
                            </div>
                            <p>${contact.message.substring(0, 200)}${contact.message.length > 200 ? '...' : ''}</p>
                        </div>
                    </div>
                `).join('');
            } else {
                list.innerHTML = '<p>No contact messages</p>';
            }
        }
    } catch (error) {
        console.error('Load contacts error:', error);
    }
}

// ===== Modal Functions =====
function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Close modal on outside click
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
});

// ===== Toast Notification =====
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    toastMessage.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ===== Utility Functions =====
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
}

function getPositionLabel(position) {
    const labels = {
        'web-dev': 'Web Development',
        'pr': 'Public Relations',
        'technical': 'Technical',
        'event': 'Event Management',
        'content': 'Content Creation'
    };
    return labels[position] || position;
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
