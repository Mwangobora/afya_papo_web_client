import EmergencyMetrics from "../../components/emergency/EmergencyMetrics";
import ActiveIncidents from "../../components/emergency/ActiveIncidents";
import FacilityStatus from "../../components/emergency/FacilityStatus";
import ResponderAssignments from "../../components/emergency/ResponderAssignments";
import PageMeta from "../../components/common/PageMeta";

export default function Home() {
  return (
    <>
      <PageMeta
        title="AfyaPapo Emergency Response Dashboard"
        description="Real-time emergency response management system for Tanzania's healthcare infrastructure"
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        {/* Emergency Metrics */}
        <div className="col-span-12">
          <EmergencyMetrics />
        </div>

        {/* Active Incidents */}
        <div className="col-span-12 xl:col-span-8">
          <ActiveIncidents />
        </div>

        {/* Facility Status */}
        <div className="col-span-12 xl:col-span-4">
          <FacilityStatus />
        </div>

        {/* Responder Assignments */}
        <div className="col-span-12">
          <ResponderAssignments />
        </div>
      </div>
    </>
  );
}
