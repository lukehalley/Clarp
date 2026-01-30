import { NextRequest, NextResponse } from 'next/server';
import {
  listProjects,
  searchProjects,
  countFilteredProjects,
  getEntityCounts,
  type ListProjectsOptions,
  type CategoryFilter,
} from '@/lib/terminal/project-service';
import type { TrustTier, EntityType } from '@/types/project';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Check if this is a search request
    const query = searchParams.get('q');
    if (query) {
      const limit = parseInt(searchParams.get('limit') || '10', 10);
      const projects = await searchProjects(query, limit);
      return NextResponse.json({ projects, total: projects.length });
    }

    // Otherwise, list with filters
    const options: ListProjectsOptions = {
      limit: parseInt(searchParams.get('limit') || '10', 10),
      offset: parseInt(searchParams.get('offset') || '0', 10),
    };

    // Order
    const orderBy = searchParams.get('orderBy');
    if (orderBy && ['last_scan_at', 'created_at', 'trust_score', 'name'].includes(orderBy)) {
      options.orderBy = orderBy as ListProjectsOptions['orderBy'];
    }

    const order = searchParams.get('order');
    if (order && ['asc', 'desc'].includes(order)) {
      options.order = order as 'asc' | 'desc';
    }

    // Trust filters
    const trustTier = searchParams.get('trustTier');
    if (trustTier && ['verified', 'trusted', 'neutral', 'caution', 'avoid'].includes(trustTier)) {
      options.trustTier = trustTier as TrustTier;
    }

    const minScore = searchParams.get('minScore');
    if (minScore) {
      options.minScore = parseInt(minScore, 10);
    }

    const maxScore = searchParams.get('maxScore');
    if (maxScore) {
      options.maxScore = parseInt(maxScore, 10);
    }

    // Entity type filter
    const entityType = searchParams.get('entityType');
    if (entityType && ['project', 'person', 'organization'].includes(entityType)) {
      options.entityType = entityType as EntityType;
    }

    // Category filter
    const category = searchParams.get('category');
    if (category && ['all', 'verified', 'high-risk', 'low-risk'].includes(category)) {
      options.category = category as CategoryFilter;
    }

    // Verified only
    if (searchParams.get('verifiedOnly') === 'true') {
      options.verifiedOnly = true;
    }

    // Build filter-only options for counts (no pagination/sorting)
    const filterOptions: Omit<ListProjectsOptions, 'limit' | 'offset' | 'orderBy' | 'order'> = {
      trustTier: options.trustTier,
      minScore: options.minScore,
      maxScore: options.maxScore,
      entityType: options.entityType,
      category: options.category,
      verifiedOnly: options.verifiedOnly,
    };

    // Entity counts need all filters EXCEPT entityType (so each tab gets its own count)
    const { entityType: _et, ...countFilterOptions } = filterOptions;

    // Fetch projects, filtered count, and entity counts in parallel
    const [projects, total, entityCounts] = await Promise.all([
      listProjects(options),
      countFilteredProjects(filterOptions),
      getEntityCounts(countFilterOptions),
    ]);

    return NextResponse.json({
      projects,
      total,
      entityCounts,
      limit: options.limit,
      offset: options.offset,
    });
  } catch (error) {
    console.error('[API/projects] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}
