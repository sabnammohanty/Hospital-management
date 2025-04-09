📌 Core Functionalities & Logic
1️⃣ Patient Management
Patients can register with basic details (name, age, address, phone).

They can book appointments by selecting a doctor and mentioning symptoms.

Patients can view their prescriptions and appointment status.

2️⃣ Doctor Management
Doctors view patient details and add observations.

They can prescribe medicines based on symptoms.

If needed, doctors can refer patients to specialists.

They can request an ambulance for severe cases.

3️⃣ Appointment System
When a patient books an appointment, it gets stored in MongoDB.

Doctors fetch pending appointments from the database.

Once the consultation is completed, the appointment is marked as "Done".

4️⃣ Medical Officer Management
Medical officers log in and view area-wise patient reports.

They can approve or reject medicine prescriptions.

They can monitor the medication status for patients.

5️⃣ Video Consultation
If a doctor initiates a video consultation, the system generates a secure link.

Patients can join the call via the website interface.

6️⃣ Reports & Analytics
Admins can generate reports based on area & patient records.

Medical officers get a dashboard showing pending cases.