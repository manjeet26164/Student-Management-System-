import { useEffect, useMemo, useState } from "react";
import { fetchStudentProfile } from "../../services/studentService";

const StudentProfile = () => {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetchStudentProfile().then(setProfile);
  }, []);

  const initials = useMemo(() => {
    if (!profile?.user?.fullName) return "--";
    return profile.user.fullName
      .split(" ")
      .slice(0, 2)
      .map((name) => name[0])
      .join("")
      .toUpperCase();
  }, [profile]);

  if (!profile) return <div className="page-loader">Loading profile...</div>;

  return (
    <div className="page-grid">
      <section className="panel profile-header">
        <div className="avatar-pill">{initials}</div>
        <div>
          <h2>{profile.user.fullName}</h2>
          <p>
            {profile.rollNumber} | {profile.branch} | Sem {profile.semester} | Sec {profile.section}
          </p>
        </div>
      </section>

      <section className="panel info-grid">
        <article>
          <h3>Personal Information</h3>
          <p>Phone: {profile.personalInfo?.phone || "-"}</p>
          <p>Date of Birth: {profile.personalInfo?.dob || "-"}</p>
          <p>Blood Group: {profile.personalInfo?.bloodGroup || "-"}</p>
        </article>
        <article>
          <h3>Academic Information</h3>
          <p>Batch: {profile.batch}</p>
          <p>Total Credits: {profile.totalCredits}</p>
          <p>CGPA: {profile.cgpa}</p>
        </article>
        <article>
          <h3>Address</h3>
          <p>{profile.address?.line1 || "-"}</p>
          <p>
            {profile.address?.city || "-"}, {profile.address?.state || "-"}
          </p>
          <p>{profile.address?.pincode || "-"}</p>
        </article>
        <article>
          <h3>Guardian Details</h3>
          <p>Name: {profile.guardian?.name || "-"}</p>
          <p>Relation: {profile.guardian?.relation || "-"}</p>
          <p>Phone: {profile.guardian?.phone || "-"}</p>
        </article>
      </section>
    </div>
  );
};

export default StudentProfile;
