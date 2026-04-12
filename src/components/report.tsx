import type { Patient, Corporate, Vital, Nutrition } from '@/lib/types';
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
  const latestVital = patient.vitals?.[0];
  const latestNutrition = patient.nutrition?.[0];
  const latestGoal = patient.goals?.[0];
  const latestClinical = patient.clinicals?.[0];

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
    latestClinical?.notes_doctor,
    latestClinical?.notes_psychologist,
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
              {latestVital?.bp_systolic && latestVital?.bp_diastolic && (
                <div className="body-text screening-item">
                  Blood Pressure: {latestVital.bp_systolic}/{latestVital.bp_diastolic} mmHg
                </div>
              )}
              {latestVital?.pulse && (
                <div className="body-text screening-item">
                  Pulse: {latestVital.pulse} bpm
                </div>
              )}
              {latestVital?.temp && (
                <div className="body-text screening-item">
                  Temperature: {latestVital.temp}°C
                </div>
              )}
               {latestNutrition?.weight && (
                <div className="body-text screening-item">
                  Weight: {latestNutrition.weight} kgs
                </div>
              )}
              {latestNutrition?.height && (
                <div className="body-text screening-item">
                  Height: {latestNutrition.height} cm
                </div>
              )}
               {latestNutrition?.visceral_fat && (
                  <div className="body-text screening-item">Visceral Fat: {latestNutrition.visceral_fat}</div>
              )}
            </div>
            <div className="screening-right">
              {latestNutrition?.bmi && (
                  <div className="body-text screening-item">BMI: {latestNutrition.bmi}</div>
              )}
              {latestVital?.rbs && (
                  <div className="body-text screening-item">
                      Blood sugar: {latestVital.rbs} mg/dL
                  </div>
              )}
              {latestNutrition?.body_fat_percent && (
                  <div className="body-text screening-item">Body fat percentage: {latestNutrition.body_fat_percent}%</div>
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

          {latestGoal && (
               <>
                  <div className="section-heading min-space-before">Personalized Health Goal</div>
                  <div className="content-section">
                      {latestGoal.discussion && <div className="content-item">{latestGoal.discussion}</div>}
                      {latestGoal.goal && <div className="target-text keep-together">Target: {latestGoal.goal}</div>}
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
