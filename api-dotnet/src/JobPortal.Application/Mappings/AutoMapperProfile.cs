// src/JobPortal.Application/Mappings/AutoMapperProfile.cs
using AutoMapper;
using JobPortal.Application.DTO.Applications;
using JobPortal.Application.DTO.Jobs;
using JobPortal.Application.DTO.Orgs;
using JobPortal.Domain.Entities;

namespace JobPortal.Application.Mappings
{
    public class AutoMapperProfile : Profile
    {
        public AutoMapperProfile()
        {
            // Applications
            CreateMap<JobApplication, ApplicationDto>().ReverseMap();

            // Jobs
            CreateMap<Job, JobDto>().ReverseMap();
            CreateMap<CreateJobRequest, Job>(); // one-way, create only

            // Organizations
            CreateMap<Organization, OrgDto>().ReverseMap();
            CreateMap<CreateOrgRequest, Organization>(); // one-way, create only

            // For PATCH/PUT updates: copy ONLY non-null fields from UpdateOrgRequest
            CreateMap<UpdateOrgRequest, Organization>()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));
        }
    }
}
