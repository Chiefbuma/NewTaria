import type { Patient, Corporate } from '@/lib/types';
import { format } from 'date-fns';

type ReportProps = {
  patient: Patient;
  corporate: Corporate | null;
};

// Helper to get the correct suffix for a day (1st, 2nd, 3rd, 4th)
function getDaySuffix(day: number) {
  if (day >= 11 && day <= 13) {
    return 'th';
  }
  switch (day % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
}

export default function Report({ patient, corporate }: ReportProps) {
  const vitals = patient.vitals?.[0];
  const nutrition = patient.nutrition?.[0];
  const clinical = patient.clinicals?.[0];
  const goal = patient.goals?.[0];

  const reportDate = patient.wellness_date ? new Date(patient.wellness_date) : null;

  let formattedDate: string;
  if (reportDate && !isNaN(reportDate.getTime())) {
    const day = reportDate.getDate();
    const suffix = getDaySuffix(day);
    formattedDate = `${format(reportDate, 'eeee, ')}${day}${suffix}${format(
      reportDate,
      ' MMMM yyyy'
    )}`;
  } else {
    formattedDate = 'Date Not Available';
  }

  const discussionParagraphs = [
    clinical?.notes_doctor,
    clinical?.notes_psychologist,
    nutrition?.notes_nutritionist,
  ].filter(Boolean) as string[];

  const mainDoctor = "Emily Carter"; // Placeholder, can be dynamically assigned

  return (
    <div className="report-body-container bg-white text-gray-800">
      <div className="header">
          <img src="/images/taria-logo.png" alt="Taria Health Logo" className="logo" />
      </div>
      <div className="content-wrapper">
        <div className="content-area">
          <div className="title-container keep-together">
            <div className="report-title">INDIVIDUAL WELLNESS REPORT:</div>
            <div className="report-date">{formattedDate}</div>
          </div>

          <div className="patient-info keep-together">
            <span className="patient-name">
              {`${patient.first_name} ${patient.surname || ''}`}
              {patient.email && ` : ${patient.email}`}
            </span>
          </div>

          <div className="section-heading min-space-before">
            Screening Results
          </div>

          <div className="screening-grid force-together">
            <div className="screening-left">
              {vitals?.bp_systolic && vitals?.bp_diastolic && (
                <div className="body-text screening-item">
                  Blood Pressure: {vitals.bp_systolic}/{vitals.bp_diastolic} mmHg
                </div>
              )}
              {vitals?.pulse && (
                <div className="body-text screening-item">
                  Pulse: {vitals.pulse} bpm
                </div>
              )}
              {vitals?.temp && (
                <div className="body-text screening-item">
                  Temperature: {vitals.temp}°C
                </div>
              )}
              {nutrition?.weight && (
                <div className="body-text screening-item">
                  Weight: {nutrition.weight} kgs
                </div>
              )}
              {nutrition?.height && (
                <div className="body-text screening-item">
                  Height: {nutrition.height} cm
                </div>
              )}
              {nutrition?.visceral_fat && (
                  <div className="body-text screening-item">Visceral Fat: {nutrition.visceral_fat}</div>
              )}
            </div>
            <div className="screening-right">
              {nutrition?.bmi && (
                  <div className="body-text screening-item">BMI: {nutrition.bmi}</div>
              )}
              {vitals?.rbs && (
                  <div className="body-text screening-item">
                      Blood sugar: {vitals.rbs} mmol/dL
                  </div>
              )}
              {nutrition?.body_fat_percent && (
                  <div className="body-text screening-item">Body fat percentage: {nutrition.body_fat_percent}%</div>
              )}
            </div>
          </div>

          <div className="keep-together">
              <div className="guidance-text body-text">Healthy weight for height range (kgs): 51.0kgs - 71.0kgs</div>
              <div className="guidance-text body-text">Healthy Body fat % ranges: Men 18-24%, Women 24-31%</div>
              <div className="guidance-text body-text">Visceral fat range: Under 12</div>
          </div>
          
          <div className="section-assessor min-space-before">Assessed by: {mainDoctor}</div>

          {discussionParagraphs.length > 0 && (
              <>
                  <div className="section-heading min-space-before">Discussion Summary</div>
                  <div className="content-section">
                      {discussionParagraphs.map((paragraph, index) => (
                          <div key={index} className={`content-item ${index > 0 ? 'min-space-before' : ''}`}>{paragraph}</div>
                      ))}
                  </div>
              </>
          )}

          {goal && (
               <>
                  <div className="section-heading min-space-before">Personalized Health Goal</div>
                  <div className="content-section">
                      {goal.discussion && <div className="content-item">{goal.discussion}</div>}
                      {goal.goal && <div className="target-text keep-together">Target: {goal.goal}</div>}
                  </div>
              </>
          )}
        
          <div className="doctor-signature keep-together min-space-before">
              <span className="doctor-prefix">Dr.</span> {mainDoctor}
          </div>

          <div className="end-spacer"></div>
        </div>
      </div>
    </div>
  );
}
