from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.core.mail import send_mail
from .forms import ContactForm, NewsletterForm

def home(request):
    contact_form=ContactForm()
    return render(request,'pages/home.html',{'contact_form':contact_form})

def contact(request):
    if request.method=='POST':
        form=ContactForm(request.POST)
        if form.is_valid():
            obj=form.save()
            send_mail(
                subject=f'Nuevo contacto: {obj.name}',
                message=f'Email: {obj.email}\n\nMensaje:\n{obj.message}',
                from_email=None,
                recipient_list=['info@bootlabpc.com'],
            )
            return render(request,'core/contact_ok.html',{'name':obj.name})
        return render(request,'pages/home.html',{'contact_form':form})
    return redirect('home')

def newsletter(request):
    if request.method=='POST':
        form=NewsletterForm(request.POST)
        if form.is_valid():
            form.save()
            return render(request,'core/newsletter_ok.html')
        return render(request,'pages/home.html',{'contact_form':ContactForm(),'newsletter_errors':form.errors})
    return redirect('home')

def api_contact(request):
    if request.method=='POST':
        form=ContactForm(request.POST)
        if form.is_valid():
            obj=form.save()
            send_mail(
                subject=f'Nuevo contacto: {obj.name}',
                message=f'Email: {obj.email}\n\nMensaje:\n{obj.message}',
                from_email=None,
                recipient_list=['info@bootlabpc.com'],
            )
            return JsonResponse({'ok':True})
        return JsonResponse({'ok':False,'errors':form.errors},status=400)
    return JsonResponse({'detail':'Method not allowed'},status=405)

def api_newsletter(request):
    if request.method=='POST':
        form=NewsletterForm(request.POST)
        if form.is_valid():
            form.save()
            return JsonResponse({'ok':True})
        return JsonResponse({'ok':False,'errors':form.errors},status=400)
    return JsonResponse({'detail':'Method not allowed'},status=405)
