import type { EnquiryFilters } from "@/lib/enquiry-query";
import {
  ENQUIRY_STATUSES,
  ENQUIRY_STATUS_LABELS,
  CALL_STATUSES,
  CALL_STATUS_LABELS,
} from "@/lib/constants";

interface Props {
  filters: EnquiryFilters;
  staff: { id: string; name: string }[];
  showStaffFilter: boolean;
}

function checked(set: string[], value: string): boolean {
  return set.includes(value);
}

export function FilterForm({ filters, staff, showStaffFilter }: Props) {
  return (
    <form method="get" action="/admin/enquiries" className="border border-line bg-white p-5">
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr_1fr_1fr_auto]">
        <div>
          <label htmlFor="q" className="label-field">Search</label>
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={filters.q ?? ""}
            placeholder="ID, name, phone or email"
            className="input-field"
          />
        </div>
        <div>
          <label htmlFor="type" className="label-field">Type</label>
          <select id="type" name="type" defaultValue={filters.enquiryType ?? ""} className="input-field">
            <option value="">All</option>
            <option value="STAY">Stay</option>
            <option value="EVENT">Event</option>
            <option value="GENERAL">General</option>
          </select>
        </div>
        <div>
          <label htmlFor="assigned" className="label-field">Assigned to</label>
          {showStaffFilter ? (
            <select id="assigned" name="assigned" defaultValue={filters.assignedStaffId ?? ""} className="input-field">
              <option value="">Anyone</option>
              <option value="unassigned">Unassigned</option>
              {staff.map((member) => (
                <option key={member.id} value={member.id}>{member.name}</option>
              ))}
            </select>
          ) : (
            <div className="input-field flex h-[46px] items-center bg-sand text-fog">Your enquiries only</div>
          )}
        </div>
        <div>
          <label htmlFor="sort" className="label-field">Sort</label>
          <div className="flex gap-2">
            <select id="sort" name="sort" defaultValue={filters.sort} className="input-field">
              <option value="created">Received</option>
              <option value="followUp">Follow-up</option>
              <option value="checkIn">Check-in</option>
              <option value="status">Status</option>
              <option value="name">Name</option>
              <option value="enquiryId">Enquiry ID</option>
            </select>
            <select id="order" name="order" defaultValue={filters.order} className="input-field">
              <option value="desc">Newest</option>
              <option value="asc">Oldest</option>
            </select>
          </div>
        </div>
        <div className="flex items-end gap-2">
          <button type="submit" className="btn-primary w-full">Apply</button>
          <a href="/admin/enquiries" className="btn-outline whitespace-nowrap">Clear</a>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <fieldset>
          <legend className="label-field">Status</legend>
          <div className="flex flex-wrap gap-2">
            {ENQUIRY_STATUSES.map((status) => (
              <label key={status} className="cursor-pointer">
                <input type="checkbox" name="status" value={status} defaultChecked={checked(filters.statuses, status)} className="peer sr-only" />
                <span className="inline-flex border border-line bg-cream px-2.5 py-1 text-[0.74rem] font-medium text-stone peer-checked:border-brass-deep peer-checked:bg-brass/15 peer-checked:text-brass-deep">
                  {ENQUIRY_STATUS_LABELS[status]}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="label-field">Call status</legend>
          <div className="flex flex-wrap gap-2">
            {CALL_STATUSES.map((status) => (
              <label key={status} className="cursor-pointer">
                <input type="checkbox" name="callStatus" value={status} defaultChecked={checked(filters.callStatuses, status)} className="peer sr-only" />
                <span className="inline-flex border border-line bg-cream px-2.5 py-1 text-[0.74rem] font-medium text-stone peer-checked:border-brass-deep peer-checked:bg-brass/15 peer-checked:text-brass-deep">
                  {CALL_STATUS_LABELS[status]}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        <div className="flex items-end">
          <label className="inline-flex cursor-pointer items-center gap-2">
            <input type="checkbox" name="overdue" value="1" defaultChecked={filters.overdueOnly} className="h-4 w-4 accent-brass-deep" />
            <span className="text-[0.82rem] text-stone">Overdue follow-ups only</span>
          </label>
        </div>
      </div>
    </form>
  );
}