from django import forms
from django.forms.models import modelformset_factory
from website.application_portal.models import Applicant

class ApplicationForm(forms.ModelForm):
	def __init__(self, *args, **kwargs):
		super(ApplicationForm, self).__init__(*args, **kwargs)
	class Meta:
		model = Applicant
		
