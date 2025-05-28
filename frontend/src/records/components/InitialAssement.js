import { useState } from "react";
import api from "../../utils/axiosInstance";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import styles from "../css/InitialAssement.module.css";

const InitialAssessment = ({ handleClose, patientId }) => {
  const [formData, setFormData] = useState({
    rating_title: "",
    relationship_to_feedback: "",
    feedback_date: "",
    duration_of_experience: "",
    present_illness: "",
    past_illness: "",
    feedback: {
      experience_feedback: false,
      health_feedback: false,
      hart_feedback: false,
      stroke_feedback: false,
      other_feedback: false,
    },
    feedbackNotes: {
      experience_feedback: "",
      health_feedback: "",
      hart_feedback: "",
      stroke_feedback: "",
      other_feedback: "",
    },
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      feedback: { ...prev.feedback, [name]: checked },
    }));
  };

  const handleNoteChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      feedbackNotes: { ...prev.feedbackNotes, [name]: value },
    }));
  };

  const handleSubmit = async (event) => {
    const payload = {
      patient_id: patientId,
      rating_title: formData.rating_title,
      relationship_to_feedback: formData.relationship_to_feedback,
      feedback_date: formData.feedback_date,
      duration_of_experience: formData.duration_of_experience,
      present_illness: formData.present_illness,
      past_illness: formData.past_illness,
      experience_feedback: formData.feedback.experience_feedback
        ? formData.feedbackNotes.experience_feedback
        : "",
      health_feedback: formData.feedback.health_feedback
        ? formData.feedbackNotes.health_feedback
        : "",
      heart_feedback: formData.feedback.heart_feedback
        ? formData.feedbackNotes.heart_feedback
        : "",
      stroke_feedback: formData.feedback.stroke_feedback
        ? formData.feedbackNotes.stroke_feedback
        : "",
      other_feedback: formData.feedback.other_feedback
        ? formData.feedbackNotes.other_feedback
        : "",
    };

    event.preventDefault();
    try {
      const response = await api.post(
        "/records/create-initial-assessment/",
        payload,
        { headers: { "Content-Type": "application/json" } }
      );
      window.dispatchEvent(new Event("refreshInitialAssessment"));
      console.log("Response:", response.data);
      alert("Form submitted successfully!");
      handleClose();
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Failed to submit the form.");
    }
  };

  return (
    <div className={`container ${styles.main}`}>
      <Form onSubmit={handleSubmit}>
        <Row className="pt-4 pb-3">
          <Col className={styles.title}>
            <Form.Label>Initial Assessment</Form.Label>
          </Col>
        </Row>
        <Row className="mb-3">
          <Form.Group as={Col} controlId="ratingTitle">
            <Form.Label>Rating Title</Form.Label>
            <Form.Control
              type="text"
              name="rating_title"
              value={formData.rating_title}
              onChange={handleChange}
              placeholder="Enter Rating Title"
              required
            />
          </Form.Group>
          <Form.Group as={Col} controlId="relationFeedback">
            <Form.Label>Relationship to Feedback</Form.Label>
            <Form.Control
              type="text"
              name="relationship_to_feedback"
              value={formData.relationship_to_feedback}
              onChange={handleChange}
              placeholder="Relation to Patient"
              required
            />
          </Form.Group>
          <Form.Group as={Col} controlId="feedbackDate">
            <Form.Label>Feedback Date</Form.Label>
            <Form.Control
              type="date"
              name="feedback_date"
              value={formData.feedback_date}
              onChange={handleChange}
              required
            />
          </Form.Group>
        </Row>

        <Row>
          <Form.Group className="mb-3">
            <Form.Label>Duration of Experience</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="duration_of_experience"
              value={formData.duration_of_experience}
              onChange={handleChange}
              placeholder="Enter Rating Title"
              required
              style={{ resize: "none" }}
            />
          </Form.Group>
        </Row>

        <Row>
          <Form.Group className="mb-3">
            <Form.Label>Present Illness</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="present_illness"
              value={formData.present_illness}
              onChange={handleChange}
              placeholder="Describe Your Experience"
              required
              style={{ resize: "none" }}
            />
          </Form.Group>
        </Row>

        <Row>
          <Form.Group className="mb-3">
            <Form.Label>Past Illness</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="past_illness"
              value={formData.past_illness}
              onChange={handleChange}
              placeholder="Describe Past Experience"
              required
              style={{ resize: "none" }}
            />
          </Form.Group>
        </Row>

        <Row>
          <h5>Family Feedback</h5>
        </Row>
        <Row className="mb-3 mt-2">
          {[
            "experience_feedback",
            "health_feedback",
            "heart_feedback",
            "stroke_feedback",
            "other_feedback",
          ].map((key) => (
            <Form.Group as={Col} md="6" key={key}>
              <Form.Check
                name={key}
                label={`${
                  key.replace("_feedback", "").charAt(0).toUpperCase() +
                  key.replace("_feedback", "").slice(1)
                } Feedback`}
                checked={formData.feedback[key]}
                onChange={handleCheckboxChange}
                className="mb-2 mt-2"
              />
              {formData.feedback[key] && (
                <Form.Control
                  type="text"
                  name={key}
                  value={formData.feedbackNotes[key]}
                  onChange={handleNoteChange}
                  placeholder={`Feedback on ${key.replace("_feedback", "")}`}
                  required
                />
              )}
            </Form.Group>
          ))}
        </Row>

        <Row>
          <div
            className={`d-flex justify-content-end gap-4 ps-5 ${styles.submit}`}
          >
            <button
              type="button"
              className={`px-2 ${styles.cancel}`}
              onClick={handleClose}
            >
              Cancel
            </button>
            <button type="submit" className={styles.savebutton}>
              Save
            </button>
          </div>
        </Row>
      </Form>
    </div>
  );
};

export default InitialAssessment;
