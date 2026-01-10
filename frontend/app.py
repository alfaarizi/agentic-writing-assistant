"""Streamlit frontend for Agentic Writing Assistant."""

import streamlit as st
import httpx
import json
from typing import Optional, Dict, Any

# Configuration
API_BASE_URL = "http://localhost:8000/api/v1"


def check_api_health() -> bool:
    """Check if API is available."""
    try:
        response = httpx.get(f"{API_BASE_URL}/health", timeout=5.0)
        return response.status_code == 200
    except Exception:
        return False


def create_profile(user_id: str, name: str, background: str, skills: list, tone: str, style: str) -> Dict[str, Any]:
    """Create or update user profile."""
    profile_data = {
        "user_id": user_id,
        "personal_info": {
            "name": name,
            "background": background,
            "education": [],
            "experience": [],
            "achievements": [],
            "skills": skills,
        },
        "writing_preferences": {
            "tone": tone,
            "style": style,
            "common_phrases": [],
        },
    }
    
    with httpx.Client() as client:
        # Try to get existing profile
        try:
            response = client.get(f"{API_BASE_URL}/profile/{user_id}")
            if response.status_code == 200:
                # Update existing
                response = client.put(f"{API_BASE_URL}/profile/{user_id}", json=profile_data)
            else:
                # Create new
                response = client.post(f"{API_BASE_URL}/profile", json=profile_data)
        except Exception:
            # Create new if get fails
            response = client.post(f"{API_BASE_URL}/profile", json=profile_data)
    
    return response.json() if response.status_code in [200, 201] else None


def generate_writing(
    user_id: str,
    writing_type: str,
    context: Dict[str, Any],
    max_words: int,
    quality_threshold: float,
    additional_info: Optional[str] = None,
) -> Dict[str, Any]:
    """Generate writing content."""
    request_data = {
        "user_id": user_id,
        "type": writing_type,
        "context": context,
        "requirements": {
            "max_words": max_words,
            "quality_threshold": quality_threshold,
            "mode": "balanced",
        },
    }
    
    if additional_info:
        request_data["additional_info"] = additional_info
    
    with httpx.Client(timeout=300.0) as client:
        response = client.post(f"{API_BASE_URL}/writing", json=request_data)
    
    return response.json() if response.status_code == 201 else None


def main():
    """Main Streamlit application."""
    st.set_page_config(
        page_title="Agentic Writing Assistant",
        page_icon="✍️",
        layout="wide",
    )
    
    st.title("✍️ Agentic Writing Assistant")
    st.markdown("Generate personalized cover letters, motivational letters, and more with AI")
    
    # Check API health
    if not check_api_health():
        st.error("⚠️ API server is not running. Please start it with:")
        st.code("cd backend && python -m uvicorn src.main:app --reload", language="bash")
        st.stop()
    
    # Sidebar for user profile
    with st.sidebar:
        st.header("👤 User Profile")
        user_id = st.text_input("User ID", value="user-1", key="user_id")
        
        st.subheader("Personal Information")
        name = st.text_input("Name", value="John Doe", key="name")
        background = st.text_area("Background", value="Software Engineer", key="background")
        skills_input = st.text_input("Skills (comma-separated)", value="Python, FastAPI, AI", key="skills")
        skills = [s.strip() for s in skills_input.split(",") if s.strip()]
        
        st.subheader("Writing Preferences")
        tone = st.selectbox("Tone", ["professional", "casual", "formal", "friendly"], key="tone")
        style = st.selectbox("Style", ["concise", "detailed", "balanced"], key="style")
        
        if st.button("💾 Save Profile"):
            with st.spinner("Saving profile..."):
                profile = create_profile(user_id, name, background, skills, tone, style)
                if profile:
                    st.success("Profile saved successfully!")
                else:
                    st.error("Failed to save profile")
    
    # Main content area
    tab1, tab2 = st.tabs(["📝 Generate Writing", "📊 View History"])
    
    with tab1:
        st.header("Create Writing Request")
        
        col1, col2 = st.columns(2)
        
        with col1:
            writing_type = st.selectbox(
                "Writing Type",
                ["cover_letter", "motivational_letter", "social_response", "email"],
                key="writing_type",
            )
            
            max_words = st.number_input("Max Words", min_value=100, max_value=2000, value=500, key="max_words")
            quality_threshold = st.slider("Quality Threshold", min_value=0.0, max_value=100.0, value=85.0, key="threshold")
        
        with col2:
            st.subheader("Context Information")
            
            if writing_type == "cover_letter":
                job_title = st.text_input("Job Title", value="Senior Software Engineer", key="job_title")
                company = st.text_input("Company", value="Google", key="company")
                context = {"job_title": job_title, "company": company}
            
            elif writing_type == "motivational_letter":
                program_name = st.text_input("Program Name", value="MIT Masters Program", key="program_name")
                scholarship_name = st.text_input("Scholarship Name (optional)", value="", key="scholarship_name")
                context = {"program_name": program_name}
                if scholarship_name:
                    context["scholarship_name"] = scholarship_name
            
            elif writing_type == "social_response":
                platform = st.selectbox("Platform", ["twitter", "linkedin", "facebook"], key="platform")
                original_post = st.text_area("Original Post", value="", key="original_post")
                context = {"platform": platform, "original_post": original_post}
            
            else:  # email
                recipient = st.text_input("Recipient", value="", key="recipient")
                subject = st.text_input("Subject", value="", key="subject")
                context = {"recipient": recipient, "subject": subject}
        
        additional_info = st.text_area("Additional Information (optional)", value="", key="additional_info")
        
        if st.button("🚀 Generate Writing", type="primary", use_container_width=True):
            if not user_id:
                st.error("Please enter a User ID")
            else:
                with st.spinner("Generating your writing... This may take a minute."):
                    result = generate_writing(
                        user_id=user_id,
                        writing_type=writing_type,
                        context=context,
                        max_words=max_words,
                        quality_threshold=quality_threshold,
                        additional_info=additional_info if additional_info else None,
                    )
                
                if result:
                    st.success("✅ Writing generated successfully!")
                    
                    # Display content
                    st.subheader("📄 Generated Content")
                    st.text_area("Content", value=result.get("content", ""), height=300, key="content_display")
                    
                    # Display assessment
                    if result.get("assessment"):
                        st.subheader("📊 Quality Assessment")
                        assessment = result["assessment"]
                        
                        col1, col2, col3 = st.columns(3)
                        
                        with col1:
                            st.metric("Overall Score", f"{assessment['quality_metrics']['overall_score']:.1f}/100")
                            st.metric("Coherence", f"{assessment['quality_metrics']['coherence']:.1f}/100")
                        
                        with col2:
                            st.metric("Naturalness", f"{assessment['quality_metrics']['naturalness']:.1f}/100")
                            st.metric("Grammar", f"{assessment['quality_metrics']['grammar_accuracy']:.1f}/100")
                        
                        with col3:
                            st.metric("Completeness", f"{assessment['quality_metrics']['completeness']:.1f}/100")
                            st.metric("Personalization", f"{assessment['quality_metrics']['personalization']:.1f}/100")
                        
                        # Text stats
                        if assessment.get("text_stats"):
                            stats = assessment["text_stats"]
                            st.subheader("📈 Text Statistics")
                            col1, col2, col3, col4 = st.columns(4)
                            with col1:
                                st.metric("Words", stats.get("word_count", 0))
                            with col2:
                                st.metric("Characters", stats.get("character_count", 0))
                            with col3:
                                st.metric("Paragraphs", stats.get("paragraph_count", 0))
                            with col4:
                                st.metric("Pages", f"{stats.get('estimated_pages', 0):.2f}")
                    
                    # Display suggestions
                    if result.get("suggestions"):
                        st.subheader("💡 Suggestions for Improvement")
                        for i, suggestion in enumerate(result["suggestions"], 1):
                            st.write(f"{i}. {suggestion}")
                    
                    # Display metadata
                    st.subheader("ℹ️ Metadata")
                    col1, col2 = st.columns(2)
                    with col1:
                        st.write(f"**Status:** {result.get('status', 'N/A')}")
                        st.write(f"**Iterations:** {result.get('iterations', 0)}")
                    with col2:
                        st.write(f"**Request ID:** {result.get('request_id', 'N/A')}")
                        st.write(f"**Created:** {result.get('created_at', 'N/A')}")
                    
                    if result.get("error"):
                        st.error(f"⚠️ Error: {result['error']}")
                else:
                    st.error("❌ Failed to generate writing. Please check the API server logs.")
    
    with tab2:
        st.header("Writing History")
        st.info("💡 History feature coming soon. Use the Request ID from generated content to retrieve specific writings via API.")


if __name__ == "__main__":
    main()

