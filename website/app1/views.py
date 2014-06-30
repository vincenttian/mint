from django.views.generic import ListView, TemplateView
from website.application_portal.models import Applicant
from django.shortcuts import redirect
from website.application_portal.forms import ApplicationForm
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.contrib import messages

class SubmitApplicantListView(TemplateView):
    template_name = 'submit_application.html'

    def form_valid(self, form):
        form.submit_applicant()
        return super(FormView, self).form_valid(form)

    def get_context_data(self, **kwargs):
        context = super(SubmitApplicantListView, self).get_context_data(**kwargs)
        if self.request.method == "GET":
            context['applicantform'] = ApplicationForm()
            return context
        else: # POST requests
            context['applicantform'] = ApplicationForm(self.request.POST, self.request.FILES)
            return context

    # THIS FUNCION IS FOR POST VALIDATION
    def post(self, request, *args, **kwargs):
        context = self.get_context_data(**kwargs)
        applicantform = context['applicantform']
        if applicantform.is_valid():
            applicantform.save()
            messages.success(request, 'applicant was successfully submitted!')
            return redirect('/')
        else:
            return self.render_to_response(context)