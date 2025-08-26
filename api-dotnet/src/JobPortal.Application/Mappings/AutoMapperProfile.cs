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
            CreateMap<CreateJobRequest, Job>();

            // Organizations
            CreateMap<Organization, OrgDto>().ReverseMap();
            CreateMap<CreateOrgRequest, Organization>();

            CreateMap<UpdateOrgRequest, Organization>()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));
        }
    }
}
