import type { Patient, Corporate, Assessment } from '@/lib/types';
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

const findLatestAssessment = (assessments: Assessment[] | undefined, parameterName: string) => {
    if (!assessments) return undefined;
    return assessments
        .filter(a => a.parameter?.name === parameterName)
        .sort((a,b) => new Date(b.measured_at).getTime() - new Date(a.measured_at).getTime())[0];
}

export default function Report({ patient, corporate }: ReportProps) {
  const bp = findLatestAssessment(patient.assessments, 'Blood Pressure')?.value.split('/');
  const bpSystolic = bp ? bp[0] : undefined;
  const bpDiastolic = bp ? bp[1] : undefined;
  const pulse = findLatestAssessment(patient.assessments, 'Pulse')?.value;
  const temp = findLatestAssessment(patient.assessments, 'Temperature')?.value;
  const weight = findLatestAssessment(patient.assessments, 'Weight')?.value;
  const height = findLatestAssessment(patient.assessments, 'Height')?.value;
  const rbs = findLatestAssessment(patient.assessments, 'Blood Glucose')?.value;
  
  // These might not exist in the new schema, so handle gracefully
  const visceral_fat = findLatestAssessment(patient.assessments, 'Visceral Fat')?.value;
  const body_fat_percent = findLatestAssessment(patient.assessments, 'Body Fat %')?.value;
  const bmi = (weight && height) ? (parseFloat(weight) / ((parseFloat(height)/100) * (parseFloat(height)/100))).toFixed(1) : undefined;
  
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
    // This part is difficult to map from the new schema without more context
    // on where clinical notes are stored. Assuming they might be in a 'Daily Notes' assessment.
    findLatestAssessment(patient.assessments, 'Daily Notes')?.notes,
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
              {bpSystolic && bpDiastolic && (
                <div className="body-text screening-item">
                  Blood Pressure: {bpSystolic}/{bpDiastolic} mmHg
                </div>
              )}
              {pulse && (
                <div className="body-text screening-item">
                  Pulse: {pulse} bpm
                </div>
              )}
              {temp && (
                <div className="body-text screening-item">
                  Temperature: {temp}°C
                </div>
              )}
              {weight && (
                <div className="body-text screening-item">
                  Weight: {weight} kgs
                </div>
              )}
              {height && (
                <div className="body-text screening-item">
                  Height: {height} cm
                </div>
              )}
              {visceral_fat && (
                  <div className="body-text screening-item">Visceral Fat: {visceral_fat}</div>
              )}
            </div>
            <div className="screening-right">
              {bmi && (
                  <div className="body-text screening-item">BMI: {bmi}</div>
              )}
              {rbs && (
                  <div className="body-text screening-item">
                      Blood sugar: {rbs} mg/dL
                  </div>
              )}
              {body_fat_percent && (
                  <div className="body-text screening-item">Body fat percentage: {body_fat_percent}%</div>
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
                      {goal.notes && <div className="content-item">{goal.notes}</div>}
                      {goal.target_value && <div className="target-text keep-together">Target: {goal.target_operator.replace(/_/g, ' ')} {goal.target_value} {goal.parameter?.unit} by {format(new Date(goal.deadline), 'MMMM d, yyyy')}</div>}
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
