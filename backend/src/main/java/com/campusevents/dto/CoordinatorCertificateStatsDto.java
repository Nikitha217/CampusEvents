package com.campusevents.dto;

public class CoordinatorCertificateStatsDto {
    private long total;
    private long eligible;
    private long issued;
    private long pending;

    public CoordinatorCertificateStatsDto() {}

    public CoordinatorCertificateStatsDto(long total, long eligible, long issued, long pending) {
        this.total = total;
        this.eligible = eligible;
        this.issued = issued;
        this.pending = pending;
    }

    public long getTotal() { return total; }
    public void setTotal(long total) { this.total = total; }

    public long getEligible() { return eligible; }
    public void setEligible(long eligible) { this.eligible = eligible; }

    public long getIssued() { return issued; }
    public void setIssued(long issued) { this.issued = issued; }

    public long getPending() { return pending; }
    public void setPending(long pending) { this.pending = pending; }
}
