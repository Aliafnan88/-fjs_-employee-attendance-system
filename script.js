const adminPassword = 'admin123';  // Admin password for record viewing

function getLocation(action) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            // Fetch the city name using reverse geocoding
            fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`)
                .then(response => response.json())
                .then(data => {
                    const city = data.city || data.locality || data.principalSubdivision || 'Unknown';  // Getting city or fallback
                    const employeeName = document.getElementById('employeeName').value;
                    if (action === 'checkIn') {
                        checkIn(employeeName, `${lat}, ${lon}`, city);
                    } else {
                        checkOut(employeeName, `${lat}, ${lon}`, city);
                    }
                })
                .catch(() => alert("Failed to retrieve city name."));
        }, function() {
            alert("Geolocation access denied.");
        });
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

function checkIn(employeeName, location, city) {
    const attendance = JSON.parse(localStorage.getItem('attendance')) || [];
    const time = new Date().toLocaleString();
    attendance.push({
        name: employeeName,
        checkIn: time,
        checkInLocation: location,
        checkInCity: city,   // Save check-in city here
        checkOut: '',
        checkOutLocation: '',
        checkOutCity: ''     // Check-out city will be empty initially
    });
    localStorage.setItem('attendance', JSON.stringify(attendance));
    alert(`Checked In: ${employeeName} at ${time} in ${city}`);
}

function checkOut(employeeName, location, city) {
    const attendance = JSON.parse(localStorage.getItem('attendance')) || [];
    const time = new Date().toLocaleString();
    const record = attendance.find(item => item.name === employeeName && item.checkOut === '');

    if (record) {
        record.checkOut = time;
        record.checkOutLocation = location;
        record.checkOutCity = city;   // Save check-out city here
        localStorage.setItem('attendance', JSON.stringify(attendance));
        alert(`Checked Out: ${employeeName} at ${time} in ${city}`);
    } else {
        alert("Check-in record not found for this employee.");
    }
}

function adminLogin() {
    const password = prompt("Please enter admin password:");
    if (password === adminPassword) {
        showAttendance();
    } else {
        alert("Incorrect password. You are not authorized to view attendance records.");
    }
}

function showAttendance() {
    const attendance = JSON.parse(localStorage.getItem('attendance')) || [];
    const attendanceTable = document.getElementById('attendanceTableBody');
    attendanceTable.innerHTML = '';
    attendance.forEach(record => {
        attendanceTable.innerHTML += `
            <tr>
                <td>${record.name}</td>
                <td>${record.checkIn}</td>
                <td>${record.checkInLocation} (${record.checkInCity})</td>
                <td>${record.checkOut || 'N/A'}</td>
                <td>${record.checkOutLocation || 'N/A'} (${record.checkOutCity || 'N/A'})</td>
            </tr>
        `;
    });
    document.querySelector('.attendance-section').style.display = 'block';
}
