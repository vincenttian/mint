from django.db import models
# Create your models here.

class Applicant(models.Model):
	# Automatically added on input
	first_name = models.CharField(max_length=50)
	last_name = models.CharField(max_length=50)
	email = models.EmailField(max_length=75)
	graduation_date = models.DateTimeField(auto_now_add=True)
	why_big_essay = models.TextField()
	big_essay1 = models.TextField()
	resume = models.FileField(upload_to='applicant_resumes')

	def __unicode__(self):
		return "Applicant: " + self.first_name + " " + self.last_name