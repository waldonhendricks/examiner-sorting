from app.services.researcher_service import ResearcherService


def test_is_south_african():
    service = ResearcherService()
    assert service.is_south_african(["University of Cape Town", "Some Department"])
    assert service.is_south_african(["Wits School of Public Health"])
    assert not service.is_south_african(["Harvard University", "Massachusetts"])


def test_normalize_university_name():
    service = ResearcherService()
    assert service.normalize_university_name("UCT Faculty of Engineering") == "University of Cape Town"
    assert service.normalize_university_name("North West University") == "North-West University"
    assert service.normalize_university_name("Unknown University") == ""
