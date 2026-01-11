import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Mail, Phone, MapPin, Calendar, Globe, Award, BookOpen, Briefcase, Code, Languages, Heart, Link as LinkIcon, MessageSquare } from 'lucide-react';
import type { UserProfile } from '@/lib/api';

interface ProfileViewProps {
  profile: UserProfile;
}

export function ProfileView({ profile }: ProfileViewProps) {
  const { personal_info, education, experience, skills, projects, certifications, awards, publications, volunteering, languages, socials, recommendations } = profile;
  const { interests } = personal_info;

  return (
    <div className="space-y-4">
      {/* Personal Information */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {(() => {
              const firstName = personal_info.first_name && personal_info.first_name !== 'Unknown' ? personal_info.first_name : '';
              const lastName = personal_info.last_name && personal_info.last_name !== 'Unknown' ? personal_info.last_name : '';
              const fullName = [firstName, lastName].filter(Boolean).join(' ');
              return fullName && (
                <div>
                  <p className="text-muted-foreground">Name</p>
                  <p className="font-semibold">
                    {fullName}
                    {personal_info.preferred_name && ` (${personal_info.preferred_name})`}
                  </p>
                </div>
              );
            })()}
            {personal_info.pronouns && (
              <div>
                <p className="text-muted-foreground">Pronouns</p>
                <p className="font-semibold">{personal_info.pronouns}</p>
              </div>
            )}
            {personal_info.date_of_birth && (
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Date of Birth</p>
                  <p className="font-semibold">{personal_info.date_of_birth}</p>
                </div>
              </div>
            )}
            {personal_info.email && (
              <div className="flex items-center gap-1.5">
                <Mail className="h-3 w-3 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <a href={`mailto:${personal_info.email}`} className="font-semibold text-primary hover:underline">
                    {personal_info.email}
                  </a>
                </div>
              </div>
            )}
            {personal_info.phone && (
              <div className="flex items-center gap-1.5">
                <Phone className="h-3 w-3 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Phone</p>
                  <p className="font-semibold">{personal_info.phone}</p>
                </div>
              </div>
            )}
            {(personal_info.city || personal_info.country) && (
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3 w-3 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Location</p>
                  <p className="font-semibold">
                    {[personal_info.city, personal_info.country].filter(Boolean).join(', ') || 'N/A'}
                  </p>
                </div>
              </div>
            )}
            {personal_info.citizenship && (
              <div className="flex items-center gap-1.5">
                <Globe className="h-3 w-3 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Citizenship</p>
                  <p className="font-semibold">{personal_info.citizenship}</p>
                </div>
              </div>
            )}
          </div>
          {personal_info.headline && (
            <div className="pt-2 border-t">
              <p className="text-muted-foreground">Headline</p>
              <p className="font-semibold">{personal_info.headline}</p>
            </div>
          )}
          {personal_info.summary && (
            <div className="pt-2 border-t">
              <p className="text-muted-foreground">Summary</p>
              <p className="text-foreground/90">{personal_info.summary}</p>
            </div>
          )}
          {personal_info.background && (
            <div className="pt-2 border-t">
              <p className="text-muted-foreground">Background</p>
              <p className="text-foreground/90">{personal_info.background}</p>
            </div>
          )}
          {interests && interests.length > 0 && (
            <div className="pt-2 border-t">
              <p className="text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <Heart className="h-3 w-3" />
                Interests
              </p>
              <div className="flex flex-wrap gap-1.5">
                {interests.map((interest: string, idx: number) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Education */}
      {education && education.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Education ({education.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {education.map((edu, idx) => (
              <div key={idx} className="border-l-2 border-primary/20 pl-3 space-y-1 text-xs">
                <p className="font-semibold text-foreground">{edu.degree}</p>
                {edu.field_of_study && <p className="text-muted-foreground">{edu.field_of_study}</p>}
                <p className="font-medium">{edu.school}</p>
                {(edu.start_date || edu.end_date) && (
                  <p className="text-muted-foreground">
                    {edu.start_date || '?'} - {edu.end_date || 'Present'}
                  </p>
                )}
                {edu.grade && <p className="text-muted-foreground">Grade: {edu.grade}</p>}
                {edu.description && <p className="text-foreground/80 mt-1">{edu.description}</p>}
                {edu.activities && <p className="text-foreground/80 mt-1">Activities: {edu.activities}</p>}
                {edu.skills && edu.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {edu.skills.map((skill, sIdx) => (
                      <Badge key={sIdx} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Experience */}
      {experience && experience.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Experience ({experience.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {experience.map((exp, idx) => (
              <div key={idx} className="border-l-2 border-primary/20 pl-3 space-y-1 text-xs">
                <p className="font-semibold text-foreground">{exp.position}</p>
                <p className="font-medium">{exp.company}</p>
                <div className="flex flex-wrap gap-2 text-muted-foreground">
                  {exp.employment_type && <Badge variant="outline" className="text-xs">{exp.employment_type.replace('_', ' ')}</Badge>}
                  {exp.location && <span>{exp.location}</span>}
                  {exp.location_type && <Badge variant="outline" className="text-xs">{exp.location_type.replace('_', ' ')}</Badge>}
                </div>
                {(exp.start_date || exp.end_date) && (
                  <p className="text-muted-foreground">
                    {exp.start_date || '?'} - {exp.end_date || 'Present'}
                  </p>
                )}
                {exp.description && <p className="text-foreground/80 mt-1 whitespace-pre-line">{exp.description}</p>}
                {exp.achievements && (
                  <p className="text-foreground/80 mt-1 whitespace-pre-line">{exp.achievements}</p>
                )}
                {exp.skills && exp.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {exp.skills.map((skill, sIdx) => (
                      <Badge key={sIdx} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Skills */}
      {skills && skills.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Code className="h-4 w-4" />
              Skills ({skills.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((skill, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {skill.name}
                  {skill.proficiency && ` (${skill.proficiency})`}
                  {skill.years_experience && ` - ${skill.years_experience}y`}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Projects */}
      {projects && projects.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Code className="h-4 w-4" />
              Projects ({projects.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {projects.map((proj, idx) => (
              <div key={idx} className="border-l-2 border-primary/20 pl-3 space-y-1 text-xs">
                <div className="flex items-start justify-between">
                  <p className="font-semibold text-foreground">{proj.name}</p>
                  {proj.url && (
                    <a href={proj.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
                <p className="text-foreground/80">{proj.description}</p>
                {(proj.start_date || proj.end_date) && (
                  <p className="text-muted-foreground">
                    {proj.start_date || '?'} - {proj.end_date || 'Present'}
                  </p>
                )}
                {proj.associated_with && <p className="text-muted-foreground">Associated with: {proj.associated_with}</p>}
                {proj.contributors && proj.contributors.length > 0 && (
                  <p className="text-muted-foreground">Contributors: {proj.contributors.join(', ')}</p>
                )}
                {proj.skills && proj.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {proj.skills.map((skill, sIdx) => (
                      <Badge key={sIdx} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Certifications */}
      {certifications && certifications.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Award className="h-4 w-4" />
              Certifications ({certifications.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            {certifications.map((cert, idx) => (
              <div key={idx} className="flex items-start justify-between">
                <div>
                  <p className="font-semibold">{cert.name}</p>
                  <p className="text-muted-foreground">{cert.issuer}</p>
                  {cert.issue_date && <p className="text-muted-foreground">Issued: {cert.issue_date}</p>}
                  {cert.credential_id && <p className="text-muted-foreground">ID: {cert.credential_id}</p>}
                </div>
                {cert.credential_url && (
                  <a href={cert.credential_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Awards */}
      {awards && awards.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Award className="h-4 w-4" />
              Awards ({awards.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            {awards.map((award, idx) => (
              <div key={idx}>
                <p className="font-semibold">{award.title}</p>
                <p className="text-muted-foreground">{award.issuer}</p>
                {award.issue_date && <p className="text-muted-foreground">{award.issue_date}</p>}
                {award.description && <p className="text-foreground/80 mt-1">{award.description}</p>}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Publications */}
      {publications && publications.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Publications ({publications.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            {publications.map((pub, idx) => (
              <div key={idx} className="flex items-start justify-between">
                <div>
                  <p className="font-semibold">{pub.title}</p>
                  {pub.publisher && <p className="text-muted-foreground">{pub.publisher}</p>}
                  {pub.publication_date && <p className="text-muted-foreground">{pub.publication_date}</p>}
                  {pub.authors && pub.authors.length > 0 && (
                    <p className="text-muted-foreground">Authors: {pub.authors.join(', ')}</p>
                  )}
                  {pub.description && <p className="text-foreground/80 mt-1">{pub.description}</p>}
                </div>
                {pub.url && (
                  <a href={pub.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Volunteering */}
      {volunteering && volunteering.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Volunteering ({volunteering.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            {volunteering.map((vol, idx) => (
              <div key={idx}>
                <p className="font-semibold">{vol.role}</p>
                <p className="text-muted-foreground">{vol.organization}</p>
                {vol.cause && <p className="text-muted-foreground">Cause: {vol.cause}</p>}
                {(vol.start_date || vol.end_date) && (
                  <p className="text-muted-foreground">
                    {vol.start_date || '?'} - {vol.end_date || 'Present'}
                  </p>
                )}
                {vol.description && <p className="text-foreground/80 mt-1">{vol.description}</p>}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Languages */}
      {languages && languages.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Languages className="h-4 w-4" />
              Languages ({languages.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5">
              {languages.map((lang, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {lang.name}
                  {lang.proficiency && ` (${lang.proficiency.replace('_', ' ')})`}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Social Links */}
      {socials && socials.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <LinkIcon className="h-4 w-4" />
              Social Links ({socials.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 text-xs">
            {socials.map((social, idx) => (
              <a
                key={idx}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-primary hover:underline"
              >
                <ExternalLink className="h-3 w-3" />
                <span className="font-medium">{social.platform}</span>
                {social.username && <span className="text-muted-foreground">({social.username})</span>}
              </a>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Recommendations ({recommendations.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            {recommendations.map((rec, idx) => (
              <div key={idx} className="border-l-2 border-primary/20 pl-3 space-y-1">
                <p className="font-semibold">{rec.name}</p>
                {rec.position && <p className="text-muted-foreground">{rec.position}</p>}
                {rec.relationship && <p className="text-muted-foreground">Relationship: {rec.relationship}</p>}
                {rec.message && <p className="text-foreground/80 mt-1 italic">"{rec.message}"</p>}
                {rec.date && <p className="text-muted-foreground text-xs mt-1">{rec.date}</p>}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

